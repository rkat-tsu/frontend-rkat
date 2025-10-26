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


class ApprovalController extends Controller
{
    // Peta peran ke status persetujuan yang mereka tunggu
    protected $roleStatusMap = [
        'WR_1' => 'Menunggu_WR1',
        'WR_2' => 'Menunggu_WR2',
        'WR_3' => 'Menunggu_WR3',
        'Dekan' => 'Menunggu_Dekan_Kepala',
        'Kepala_Unit' => 'Menunggu_Dekan_Kepala', // Digunakan untuk Kepala Unit non-Fakultas
    ];

    /**
     * Menampilkan daftar RKAT yang perlu disetujui oleh pengguna saat ini.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $peran = $user->peran;
        $unitId = $user->id_unit;
        
        // Cek apakah user adalah Approver yang terdaftar
        if (!array_key_exists($peran, $this->roleStatusMap) && $peran !== 'Rektor' && $peran !== 'Admin') {
            return Inertia::render('Error', ['status' => 403, 'message' => 'Anda bukan approver.']);
        }

        $targetStatus = $this->roleStatusMap[$peran] ?? null;

        $query = RkatHeader::with(['unit:id_unit,nama_unit', 'programKerja:id_proker,nama_proker'])
            ->whereIn('status_persetujuan', array_values($this->roleStatusMap)); // Filter awal

        // LOGIKA FILTER BERDASARKAN PERAN DAN UNIT
        if ($targetStatus) {
            $query->where('status_persetujuan', $targetStatus);
            
            // Logika Dekan/Kepala Unit: Hanya tampilkan RKAT dari unit yang mereka pimpin atau di bawahnya
            if ($peran === 'Dekan' || $peran === 'Kepala_Unit') {
                // Ambil semua ID unit anak (prodi/unit) di bawah unit user saat ini
                $childUnitIds = $user->unit->children->pluck('id_unit')->toArray();
                
                // Tambahkan ID unit user itu sendiri jika dia adalah kepala unit
                $unitAksesIds = array_merge([$unitId], $childUnitIds);
                
                $query->whereIn('id_unit', $unitAksesIds);
            }
        }
        // Rektor/Admin biasanya melihat semua, tetapi ini tergantung kebijakan.
        // Untuk WR (WR_1, WR_2, WR_3) dan Rektor, mereka melihat semua RKAT yang statusnya 'Menunggu_<Peran_Mereka>'

        $rkatList = $query->latest()->get();

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
        
        // 1. Validasi Input
        $request->validate([
            'aksi' => ['required', 'string', Rule::in(['Setuju', 'Revisi', 'Tolak'])],
            'catatan' => 'nullable|string|max:1000',
        ]);

        // Cek status saat ini dan pastikan pengguna berhak menyetujui di level ini
        $targetStatus = $this->roleStatusMap[$user->peran] ?? null;
        if ($rkatHeader->status_persetujuan !== $targetStatus && $rkatHeader->status_persetujuan !== 'Menunggu_WR2' /* dan Rektor/Final */) {
            return Redirect::back()->withErrors(['error' => 'RKAT ini tidak berada pada status persetujuan Anda.']);
        }

        $aksi = $request->aksi;
        
        DB::transaction(function () use ($rkatHeader, $user, $aksi, $request) {
            // 2. Tentukan Status Baru dan Level Log
            $level = $user->peran;
            $newStatus = $rkatHeader->status_persetujuan;

            if ($aksi === 'Setuju') {
                $newStatus = $this->getNextStatus($rkatHeader->status_persetujuan);
            } elseif ($aksi === 'Revisi') {
                $newStatus = 'Revisi';
            } elseif ($aksi === 'Tolak') {
                $newStatus = 'Ditolak';
            }

            // 3. Update Status RKAT Header
            $rkatHeader->status_persetujuan = $newStatus;
            $rkatHeader->save();

            // 4. Catat Log Persetujuan
            LogPersetujuan::create([
                'id_header' => $rkatHeader->id_header,
                'id_approver' => $user->id_user,
                'level_persetujuan' => $level,
                'aksi' => $aksi,
                'catatan' => $request->catatan,
            ]);
        });

        return Redirect::route('approver.index')->with('success', "RKAT #{$rkatHeader->id_header} berhasil di{$aksi}.");
    }

    /**
     * Menentukan status persetujuan berikutnya.
     */
    protected function getNextStatus(string $currentStatus): string
    {
        $flow = [
            'Menunggu_Dekan_Kepala' => 'Disetujui_L1', // L1 = Level 1 (Kepala Unit/Dekan)
            'Disetujui_L1' => 'Menunggu_WR1',
            'Menunggu_WR1' => 'Disetujui_WR1',
            'Disetujui_WR1' => 'Menunggu_WR3',
            'Menunggu_WR3' => 'Disetujui_WR3',
            'Disetujui_WR3' => 'Menunggu_WR2',
            'Menunggu_WR2' => 'Disetujui_WR2',
            'Disetujui_WR2' => 'Disetujui_Final', // Rektor/Final jika tidak ada WR lain di atas WR2
            // Tambahkan logika Rektor jika diperlukan sebelum Final
        ];
        
        return $flow[$currentStatus] ?? 'Menunggu_Dekan_Kepala'; // Default jika status tidak ditemukan
    }
}