<?php

namespace App\Http\Controllers;

use App\Models\RkatHeader;
use App\Models\LogPersetujuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect; // Gunakan Redirect
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
     *
     * [VERSI PERBAIKAN]
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $peran = $user->peran;
<<<<<<< HEAD

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

=======
        $unitId = $user->id_unit;
        
        // 1. Cek hak akses
        if (!array_key_exists($peran, $this->roleStatusMap) && $peran !== 'Rektor' && $peran !== 'Admin') {
            return Inertia::render('Approval/Index', [
                'rkatMenunggu' => [],
                'currentRole' => $peran,
                'message' => 'Anda tidak memiliki hak akses approver.'
            ]);
        }

        // 2. Tentukan status apa saja yang dianggap "sedang menunggu"
        // Ini adalah status yang akan dilihat oleh Admin/Rektor
        $allApprovalStatuses = [
            'Diajukan', // Status awal setelah submit (jika ada)
            'Menunggu_Dekan_Kepala',
            'Disetujui_L1', // Menunggu WR1
            'Menunggu_WR1',
            'Disetujui_WR1', // Menunggu WR3
            'Menunggu_WR3',
            'Disetujui_WR3', // Menunggu WR2
            'Menunggu_WR2',
            'Disetujui_WR2', // Menunggu Final
        ];
        
        // 3. Buat query dasar
        // 'programKerja' dihapus karena relasi ada di detail, bukan header
        $query = RkatHeader::with('unit:id_unit,nama_unit'); 

        // 4. Terapkan filter berdasarkan PERAN
>>>>>>> 4ba6e9977d92b54baeb13d4cf9f896290ee190e8
        $targetStatus = $this->roleStatusMap[$peran] ?? null;

        if ($targetStatus) {
            // INI UNTUK APPROVER SPESIFIK (WR_1, Dekan, dll)
            $query->where('status_persetujuan', $targetStatus);
<<<<<<< HEAD

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

=======
            
            // Logika Dekan/Kepala Unit: Hanya tampilkan RKAT dari unit yang mereka pimpin atau di bawahnya
            // Memastikan user->unit ada sebelum diakses
            if (($peran === 'Dekan' || $peran === 'Kepala_Unit') && $user->unit) {
                // Eager load relasi 'children' pada unit milik user
                $userUnit = $user->load('unit.children');
                $childUnitIds = $userUnit->unit->children->pluck('id_unit')->toArray();
                
                $unitAksesIds = array_merge([$unitId], $childUnitIds);
                
                $query->whereIn('id_unit', $unitAksesIds);
            }
        } else if ($peran === 'Rektor' || $peran === 'Admin') {
            // INI UNTUK ADMIN / REKTOR (Lihat semua yang sedang diproses)
            $query->whereIn('status_persetujuan', $allApprovalStatuses);
        } else {
            // Jika tidak ada peran yang cocok (seharusnya tidak terjadi karena cek di awal)
            $query->whereRaw('1 = 0'); // Tampilkan 0
        }

>>>>>>> 4ba6e9977d92b54baeb13d4cf9f896290ee190e8
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
<<<<<<< HEAD

=======
        $peran = $user->peran;
        
        // 1. Validasi Input
>>>>>>> 4ba6e9977d92b54baeb13d4cf9f896290ee190e8
        $request->validate([
            'aksi' => ['required', 'string', Rule::in(['Setuju', 'Revisi', 'Tolak'])],
            // Catatan wajib jika Revisi atau Tolak
            'catatan' => [
                Rule::requiredIf(fn () => $request->aksi === 'Revisi' || $request->aksi === 'Tolak'),
                'nullable',
                'string',
                'max:1000'
            ],
        ]);

<<<<<<< HEAD
        $currentStatus = $rkatHeader->status_persetujuan;
        $expectedStatus = $this->roleStatusMap[$user->peran] ?? null;

        if ($currentStatus !== $expectedStatus) {
            return Redirect::back()->withErrors([
                'error' => 'RKAT ini tidak berada pada status persetujuan Anda atau statusnya telah berubah.'
            ]);
=======
        // 2. Cek status saat ini dan pastikan pengguna berhak menyetujui di level ini
        $targetStatus = $this->roleStatusMap[$peran] ?? null;
        
        // Logika Pengecekan Hak Akses (Disempurnakan)
        $canApprove = false;
        if ($targetStatus && $rkatHeader->status_persetujuan === $targetStatus) {
            // Approver spesifik (Dekan, WR_1, dll)
            $canApprove = true;
        } else if ($peran === 'Admin' || $peran === 'Rektor') {
            // Admin/Rektor bisa approve di level mana saja (sesuai status yang menunggu)
            $allApprovalStatuses = [
                'Diajukan', 'Menunggu_Dekan_Kepala', 'Disetujui_L1', 'Menunggu_WR1',
                'Disetujui_WR1', 'Menunggu_WR3', 'Disetujui_WR3', 'Menunggu_WR2', 'Disetujui_WR2',
            ];
            if (in_array($rkatHeader->status_persetujuan, $allApprovalStatuses)) {
                $canApprove = true;
            }
>>>>>>> 4ba6e9977d92b54baeb13d4cf9f896290ee190e8
        }

        if (!$canApprove) {
            return Redirect::back()->withErrors(['error' => 'RKAT ini tidak berada pada status persetujuan Anda atau sudah diproses.']);
        }


        $aksi = $request->aksi;
<<<<<<< HEAD

        DB::transaction(function () use ($rkatHeader, $user, $aksi, $request) {
            $newStatus = match ($aksi) {
                'Setuju' => $this->getNextStatus($rkatHeader),
                'Revisi' => 'Revisi',
                'Tolak' => 'Ditolak',
                default => $rkatHeader->status_persetujuan,
            };

            $rkatHeader->update(['status_persetujuan' => $newStatus]);

=======
        
        DB::transaction(function () use ($rkatHeader, $user, $aksi, $request, $peran) {
            // 3. Tentukan Status Baru dan Level Log
            $level = $peran;
            $newStatus = $rkatHeader->status_persetujuan;
            $currentStatus = $rkatHeader->status_persetujuan;

            if ($aksi === 'Setuju') {
                // Jika Admin/Rektor yang setuju, tentukan status berikutnya berdasarkan level saat ini
                if ($peran === 'Admin' || $peran === 'Rektor') {
                    $newStatus = $this->getNextStatus($currentStatus);
                } else {
                    // Jika approver spesifik, gunakan flow normal
                    $newStatus = $this->getNextStatus($currentStatus);
                }
            } elseif ($aksi === 'Revisi') {
                $newStatus = 'Revisi';
            } elseif ($aksi === 'Tolak') {
                $newStatus = 'Ditolak';
            }

            // 4. Update Status RKAT Header
            $rkatHeader->status_persetujuan = $newStatus;
            $rkatHeader->save();

            // 5. Catat Log Persetujuan
>>>>>>> 4ba6e9977d92b54baeb13d4cf9f896290ee190e8
            LogPersetujuan::create([
                'id_header' => $rkatHeader->id_header,
                'id_approver' => $user->id_user,
                'level_persetujuan' => $user->peran,
                'aksi' => $aksi,
                'catatan' => $request->catatan,
            ]);
        });

<<<<<<< HEAD
        return Redirect::route('approval.index')->with('success', "RKAT #{$rkatHeader->id_header} berhasil di{$aksi}.");
=======
        return Redirect::route('approver.index')->with('success', "RKAT #{$rkatHeader->id_header} berhasil di-{$aksi}.");
>>>>>>> 4ba6e9977d92b54baeb13d4cf9f896290ee190e8
    }

    /**
     * Menentukan status persetujuan berikutnya secara dinamis.
     */
    protected function getNextStatus(RkatHeader $rkat): string
    {
<<<<<<< HEAD
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
=======
        $flow = [
            'Diajukan' => 'Menunggu_Dekan_Kepala', // Flow jika 'Diajukan' adalah status awal
            'Menunggu_Dekan_Kepala' => 'Disetujui_L1', // L1 = Level 1 (Kepala Unit/Dekan)
            'Disetujui_L1' => 'Menunggu_WR1',
            'Menunggu_WR1' => 'Disetujui_WR1',
            'Disetujui_WR1' => 'Menunggu_WR3',
            'Menunggu_WR3' => 'Disetujui_WR3',
            'Disetujui_WR3' => 'Menunggu_WR2',
            'Menunggu_WR2' => 'Disetujui_WR2',
            'Disetujui_WR2' => 'Disetujui_Final', // Rektor/Final jika tidak ada WR lain di atas WR2
        ];
        
        // Default adalah status saat ini jika tidak ada di flow (misal: 'Draft')
        return $flow[$currentStatus] ?? $currentStatus; 
>>>>>>> 4ba6e9977d92b54baeb13d4cf9f896290ee190e8
    }
}