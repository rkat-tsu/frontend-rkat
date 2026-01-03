<?php

namespace App\Http\Controllers;

use App\Models\LogPersetujuan;
use App\Models\RkatHeader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    protected $roleStatusMap = [
        'Kepala_Unit' => 'Menunggu_Dekan_Kepala',
        'Dekan' => 'Menunggu_Dekan_Kepala',
        'WR_1' => 'Menunggu_WR1',
        'WR_2' => 'Menunggu_WR2',
        'WR_3' => 'Menunggu_WR3',
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $peran = $user->peran;
        
        Log::debug('[Approval] Akses Index oleh: ' . $user->username . ' Peran: ' . $peran);

        // Otorisasi
        if (! $user->isApprover() && ! $user->isAdmin()) {
            Log::warning('[Approval] Akses Ditolak untuk: ' . $user->username);
            return Inertia::render('Error', [
                'status' => 403,
                'message' => 'Anda tidak memiliki hak akses untuk halaman ini.',
            ]);
        }

        $query = RkatHeader::with([
            'unit:id_unit,nama_unit,jalur_persetujuan',
        ]);

        $targetStatus = $this->roleStatusMap[$peran] ?? null;
        Log::debug('[Approval] Status Target untuk peran: ' . ($targetStatus ?? 'Tidak Ada/Admin'));

        if ($targetStatus) {
            $query->where('status_persetujuan', $targetStatus);

            if ($user->isUnitHead()) {
                if ($user->unit) {
                    $childUnitIds = $user->unit->children->pluck('id_unit')->toArray();
                    $unitAksesIds = array_merge([$user->id_unit], $childUnitIds);
                    $query->whereIn('id_unit', $unitAksesIds);
                } else {
                    $query->whereRaw('1 = 0');
                }
            }
        } elseif (in_array($peran, ['Admin', 'Rektor'])) {
            $validStatuses = array_values($this->roleStatusMap);
            $query->whereIn('status_persetujuan', $validStatuses);
        } else {
            $query->whereRaw('1 = 0');
        }

        $rkatList = $query->latest('updated_at')->get();
        Log::debug('[Approval] Memuat ' . $rkatList->count() . ' item untuk persetujuan.');

        return Inertia::render('Approval/Index', [
            'rkatMenunggu' => $rkatList,
            'currentRole' => $peran,
        ]);
    }

    public function approve(Request $request, RkatHeader $rkatHeader): RedirectResponse
    {
        $user = $request->user();
        Log::info('[Approval] Permintaan Aksi', [
            'user' => $user->username,
            'rkat_id' => $rkatHeader->id_header,
            'action' => $request->aksi
        ]);

        $request->validate([
            'aksi' => ['required', 'string', Rule::in(['Setuju', 'Revisi', 'Tolak'])],
            'catatan' => [
                Rule::requiredIf(fn () => $request->aksi === 'Revisi' || $request->aksi === 'Tolak'),
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $currentStatus = $rkatHeader->status_persetujuan;
        $expectedStatus = $this->roleStatusMap[$user->peran] ?? null;

        if ($currentStatus !== $expectedStatus) {
            Log::error('[Approval] Ketidakcocokan Status', ['saat_ini' => $currentStatus, 'diharapkan' => $expectedStatus]);
            return Redirect::back()->withErrors([
                'error' => 'RKAT ini tidak berada pada status persetujuan Anda atau statusnya telah berubah.',
            ]);
        }
        
        $aksi = $request->aksi;

        DB::transaction(function () use ($rkatHeader, $user, $aksi, $request) {
            $oldStatus = $rkatHeader->status_persetujuan;
            
            $newStatus = match ($aksi) {
                'Setuju' => $this->getNextStatus($rkatHeader),
                'Revisi' => 'Revisi',
                'Tolak' => 'Ditolak',
                default => $rkatHeader->status_persetujuan,
            };

            $rkatHeader->update(['status_persetujuan' => $newStatus]);
            
            Log::info("[Approval] Status Berubah: $oldStatus -> $newStatus");

            LogPersetujuan::create([
                'id_header' => $rkatHeader->id_header,
                'id_approver' => $user->id_user,
                'level_persetujuan' => $user->peran,
                'aksi' => $aksi,
                'catatan' => $request->catatan,
            ]);
        });

        return Redirect::route('approval.index')->with('success', "RKAT #{$rkatHeader->id_header} berhasil di{$aksi}.");
    }

    protected function getNextStatus(RkatHeader $rkat): string
    {
        $currentStatus = $rkat->status_persetujuan;
        $rkat->loadMissing('unit');

        if (! $rkat->unit) {
            Log::warning('[Approval] Unit hilang untuk RKAT ID: ' . $rkat->id_header);
            return $currentStatus;
        }

        $jalur = $rkat->unit->jalur_persetujuan ?? 'akademik';
        Log::debug('[Approval] Menghitung status berikutnya melalui jalur: ' . $jalur);

        $flows = [
            'akademik' => [
                'Menunggu_Dekan_Kepala' => 'Menunggu_WR1',
                'Menunggu_WR1' => 'Menunggu_WR3',
                'Menunggu_WR3' => 'Menunggu_WR2',
                'Menunggu_WR2' => 'Disetujui_Final',
            ],
            'non_akademik' => [
                'Menunggu_Dekan_Kepala' => 'Menunggu_WR3',
                'Menunggu_WR3' => 'Menunggu_WR1',
                'Menunggu_WR1' => 'Menunggu_WR2',
                'Menunggu_WR2' => 'Disetujui_Final',
            ],
        ];

        $activeFlow = $flows[$jalur] ?? $flows['akademik'];

        return $activeFlow[$currentStatus] ?? $currentStatus;
    }
}