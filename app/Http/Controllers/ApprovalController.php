<?php

namespace App\Http\Controllers;

use App\Models\LogPersetujuan;
use App\Models\RkatHeader;
use App\Models\TahunAnggaran;
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
    // Pemetaan Role ke Status Dokumen yang sedang menunggu
    protected $roleStatusMap = [
        'Kepala_Unit' => 'Menunggu_Unit_Kepala',
        'Dekan'       => 'Menunggu_Dekan_Kepala',
        'Tim_Renbang' => 'Menunggu_Tim_Renbang',
        'WR_1'        => 'Menunggu_WR1',
        'WR_2'        => 'Menunggu_WR2',
        'WR_3'        => 'Menunggu_WR3',
    ];

    /**
     * Menampilkan Halaman Daftar RKAT yang butuh persetujuan
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $peran = $user->peran;
        
        Log::debug('[Approval] Akses Index oleh: ' . $user->username . ' Peran: ' . $peran);

        // Otorisasi: Hanya approver dan Admin yang boleh masuk
        if (! $user->isApprover() && ! $user->isAdmin()) {
            Log::warning('[Approval] Akses Ditolak untuk: ' . $user->username);
            abort(403, 'Anda tidak memiliki hak akses untuk halaman ini.');
        }

        // === CEK STATUS TAHUN ANGGARAN ===
        // Hanya izinkan review jika ada Tahun Anggaran dengan status 'Approved'
        $activeTahun = TahunAnggaran::where('status_rkat', 'Approved')->exists();
        if (!$activeTahun && !$user->isAdmin()) {
             return Inertia::render('Approval/Index', [
                'rkatMenunggu' => [],
                'currentRole'  => $peran,
                'message'      => 'Tahap review belum dibuka atau sudah ditutup.'
            ]);
        }

        $query = RkatHeader::with([
            'unit:id_unit,nama_unit,jalur_persetujuan',
        ]);

        $targetStatus = $this->roleStatusMap[$peran] ?? null;
        Log::debug('[Approval] Status Target untuk peran: ' . ($targetStatus ?? 'Tidak Ada/Admin'));

        // === LOGIKA FILTER AKSES ===
        if (in_array($peran, ['Admin', 'Rektor'])) {
            // ADMIN & REKTOR: Bisa melihat semua dokumen yang sedang berada di proses approval (semua lini)
            $validStatuses = array_values($this->roleStatusMap);
            $query->whereIn('status_persetujuan', $validStatuses);
        } 
        elseif ($targetStatus) {
            // USER BIASA (Kepala Unit, Dekan, WR): Hanya melihat yang sesuai target statusnya
            $query->where('status_persetujuan', $targetStatus);

            if ($user->isUnitHead()) {
                if ($user->unit) {
                    $childUnitIds = $user->unit->children->pluck('id_unit')->toArray();
                    $unitAksesIds = array_merge([$user->id_unit], $childUnitIds);
                    $query->whereIn('id_unit', $unitAksesIds);
                } else {
                    $query->whereRaw('1 = 0'); // Fallback jika tidak punya unit
                }
            }
        } 
        else {
            // Jika role tidak dikenali, jangan tampilkan apa-apa
            $query->whereRaw('1 = 0');
        }

        $rkatList = $query->latest('updated_at')->get();
        Log::debug('[Approval] Memuat ' . $rkatList->count() . ' item untuk persetujuan.');

        return Inertia::render('Approval/Index', [
            'rkatMenunggu' => $rkatList,
            'currentRole'  => $peran,
        ]);
    }

    /**
     * Memproses Aksi (Setuju, Revisi, Tolak)
     */
    public function approve(Request $request, RkatHeader $rkatHeader): RedirectResponse
    {
        $user = $request->user();
        Log::info('[Approval] Permintaan Aksi', [
            'user'    => $user->username,
            'rkat_id' => $rkatHeader->id_header,
            'action'  => $request->aksi
        ]);

        // 1. Validasi Input
        $request->validate([
            'aksi'    => ['required', 'string', Rule::in(['Setuju', 'Revisi', 'Tolak'])],
            'catatan' => [
                Rule::requiredIf(fn () => $request->aksi === 'Revisi' || $request->aksi === 'Tolak'),
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $rkatHeader->load('tahunAnggaran');
        if ($rkatHeader->tahunAnggaran->status_rkat !== 'Approved' && !$user->isAdmin()) {
            return Redirect::back()->withErrors([
                'error' => 'Persetujuan hanya dapat dilakukan pada tahap Approved (Review).',
            ]);
        }

        $currentStatus = $rkatHeader->status_persetujuan;
        $expectedStatus = $this->roleStatusMap[$user->peran] ?? null;
        
        // 2. Cek Hak Akses Eksekusi (Bypass Khusus Admin/Rektor)
        $isAdminOrRektor = in_array($user->peran, ['Admin', 'Rektor']);

        if (!$isAdminOrRektor && $currentStatus !== $expectedStatus) {
            Log::error('[Approval] Ketidakcocokan Status', ['saat_ini' => $currentStatus, 'diharapkan' => $expectedStatus]);
            return Redirect::back()->withErrors([
                'error' => 'RKAT ini tidak berada pada status persetujuan Anda atau statusnya telah berubah.',
            ]);
        }
        
        $aksi = $request->aksi;

        try {
            // 3. Proses Transaksi Database
            DB::transaction(function () use ($rkatHeader, $user, $aksi, $request) {
                $oldStatus = $rkatHeader->status_persetujuan;
                
                // Tentukan status berikutnya berdasarkan aksi
                $newStatus = match ($aksi) {
                    'Setuju' => $this->getNextStatus($rkatHeader), // Lanjut ke step berikutnya
                    'Revisi' => 'Revisi', // Mundur ke Inputer
                    'Tolak'  => 'Ditolak', // Berhenti total
                    default  => $rkatHeader->status_persetujuan,
                };

                // Update Status RKAT
                $rkatHeader->update(['status_persetujuan' => $newStatus]);
                Log::info("[Approval] Status Berubah: $oldStatus -> $newStatus");

                // Catat Riwayat Persetujuan (Audit Trail)
                LogPersetujuan::create([
                    'id_header'         => $rkatHeader->id_header,
                    'id_approver'       => $user->id_user,
                    'level_persetujuan' => $user->peran, 
                    'aksi'              => $aksi,
                    'catatan'           => $request->catatan,
                ]);
            });

            return Redirect::route('approval.index')->with('success', "RKAT #{$rkatHeader->id_header} berhasil di{$aksi}.");
        } catch (\Exception $e) {
            Log::error('[Approval] Gagal memproses aksi: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return Redirect::back()->withErrors([
                'error' => 'Gagal memproses persetujuan: ' . $e->getMessage(),
            ])->with('error', 'Gagal memproses persetujuan: ' . $e->getMessage());
        }
    }

    /**
     * Menentukan Status Selanjutnya (State Machine Alur Persetujuan)
     */
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

        // State Machine Flow
        $flows = [
            'akademik' => [
                'Menunggu_Unit_Kepala'  => 'Menunggu_Dekan_Kepala',
                'Menunggu_Dekan_Kepala' => 'Menunggu_Tim_Renbang',
                'Menunggu_Tim_Renbang'  => 'Menunggu_WR1',
                'Menunggu_WR1'          => 'Menunggu_WR2',
                'Menunggu_WR2'          => 'Disetujui_Final',
            ],
            'non-akademik' => [
                'Menunggu_Unit_Kepala'  => 'Menunggu_Tim_Renbang',
                'Menunggu_Tim_Renbang'  => 'Menunggu_WR3',
                'Menunggu_WR3'          => 'Menunggu_WR2',
                'Menunggu_WR2'          => 'Disetujui_Final',
            ],
        ];

        $activeFlow = $flows[$jalur] ?? $flows['akademik'];

        // Jika status saat ini ada di dalam alur, majukan ke status selanjutnya.
        // Jika tidak ada (atau sudah di ujung), kembalikan status saat ini.
        return $activeFlow[$currentStatus] ?? $currentStatus;
    }
}