<?php

namespace App\Http\Controllers;

use App\Models\RkatHeader;
use App\Models\LogPersetujuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;
use Illuminate\Support\Facades\Redirect;

class ApprovalController extends Controller
{
    /**
     * Peta peran ke status persetujuan yang mereka tunggu
     */
    protected $roleStatusMap = [
        'Kepala_Unit' => 'Menunggu_Dekan_Kepala',
        'Dekan' => 'Menunggu_Dekan_Kepala',
        'WR_1' => 'Menunggu_WR1',
        'WR_2' => 'Menunggu_WR2',
        'WR_3' => 'Menunggu_WR3',
    ];

    /**
     * Menampilkan daftar RKAT yang perlu disetujui oleh pengguna saat ini.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $peran = $user->peran;

        // Otorisasi
        if (!$user->isApprover() && !$user->isAdmin()) {
            return Inertia::render('Error', [
                'status' => 403,
                'message' => 'Anda tidak memiliki hak akses untuk halaman ini.'
            ]);
        }

        $query = RkatHeader::with([
            'unit:id_unit,nama_unit,jalur_persetujuan',
            'programKerja:id_proker,nama_proker'
        ]);

        $targetStatus = $this->roleStatusMap[$peran] ?? null;

        if ($targetStatus) {
            $query->where('status_persetujuan', $targetStatus);

            // Filter khusus untuk Kepala Unit / Dekan
            if ($user->isUnitHead()) {
                if ($user->unit) {
                    $childUnitIds = $user->unit->children->pluck('id_unit')->toArray();
                    $unitAksesIds = array_merge([$user->id_unit], $childUnitIds);
                    $query->whereIn('id_unit', $unitAksesIds);
                } else {
                    $query->whereRaw('1 = 0');
                }
            }
        } else if (in_array($peran, ['Admin', 'Rektor'])) {
            // Admin/Rektor melihat semua proses persetujuan aktif
            $validStatuses = array_values($this->roleStatusMap);
            $query->whereIn('status_persetujuan', $validStatuses);
        } else {
            $query->whereRaw('1 = 0');
        }

        $rkatList = $query->latest('updated_at')->get();

        return Inertia::render('Approval/Index', [
            'rkatMenunggu' => $rkatList,
            'currentRole' => $peran,
        ]);
    }

    /**
     * Menyimpan aksi persetujuan/revisi/tolak.
     */
    public function approve(Request $request, RkatHeader $rkatHeader): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'aksi' => ['required', 'string', Rule::in(['Setuju', 'Revisi', 'Tolak'])],
            'catatan' => 'nullable|string|max:1000',
        ]);

        $currentStatus = $rkatHeader->status_persetujuan;
        $expectedStatus = $this->roleStatusMap[$user->peran] ?? null;

        if ($currentStatus !== $expectedStatus) {
            return Redirect::back()->withErrors([
                'error' => 'RKAT ini tidak berada pada status persetujuan Anda atau statusnya telah berubah.'
            ]);
        }

        $aksi = $request->aksi;

        DB::transaction(function () use ($rkatHeader, $user, $aksi, $request) {
            $newStatus = match ($aksi) {
                'Setuju' => $this->getNextStatus($rkatHeader),
                'Revisi' => 'Revisi',
                'Tolak' => 'Ditolak',
                default => $rkatHeader->status_persetujuan,
            };

            $rkatHeader->update(['status_persetujuan' => $newStatus]);

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

    /**
     * Menentukan status persetujuan berikutnya secara dinamis.
     */
    protected function getNextStatus(RkatHeader $rkat): string
    {
        $currentStatus = $rkat->status_persetujuan;
        $rkat->loadMissing('unit');

        if (!$rkat->unit) {
            return $currentStatus;
        }

        $jalur = $rkat->unit->jalur_persetujuan ?? 'akademik';

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