<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\RkatHeader; // Pastikan Anda sudah membuat model ini
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Menampilkan halaman dashboard dengan data statistik.
     */
    public function index()
    {
        $user = Auth::user();
        
        // 1. Tentukan query dasar berdasarkan peran pengguna
        // Peran Super Admin/Pusat (melihat semua data)
        $superAdminRoles = ['Admin', 'Rektor', 'WR_1', 'WR_2', 'WR_3'];

        // Buat query builder
        $baseQuery = RkatHeader::query();

        // Jika peran BUKAN super admin, filter berdasarkan unit pengguna
        if (!in_array($user->peran, $superAdminRoles)) {
            // Asumsi: Dekan, Kaprodi, Kepala_Unit, dan Inputer hanya melihat RKAT dari unit mereka
            $baseQuery->where('id_unit', $user->id_unit);
        }

        // 2. Ambil Statistik (DUMMY_STATS)
        
        // Definisikan status untuk setiap kategori
        // Ini didasarkan pada enum 'status_persetujuan' di migrasi Anda
        $pendingStatuses = [
            'Draft', // <-- TAMBAHKAN BARIS INI
            'Diajukan', 'Revisi', 'Disetujui_L1', 
            'Menunggu_Dekan_Kepala', 'Menunggu_WR1', 'Menunggu_WR3', 'Menunggu_WR2'
        ];
        $approvedStatuses = ['Disetujui_WR1', 'Disetujui_WR2', 'Disetujui_WR3', 'Disetujui_Final'];
        $rejectedStatuses = ['Ditolak'];

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->whereIn('status_persetujuan', $pendingStatuses)->count(),
            'approved' => (clone $baseQuery)->whereIn('status_persetujuan', $approvedStatuses)->count(),
            'rejected' => (clone $baseQuery)->whereIn('status_persetujuan', $rejectedStatuses)->count(),
        ];

        // 3. Ambil RKAT Terbaru (DUMMY_RKAT_TERBARU)
        $recentRkats = (clone $baseQuery)
            ->with('unit') // Eager-load relasi 'unit' untuk mendapatkan nama_unit
            ->latest('updated_at') // Urutkan berdasarkan yang terbaru diupdate
            ->take(5) // Ambil 5 data teratas
            ->get();

        // 4. Format data untuk frontend (sesuai Dashboard.jsx)
        $rkatTerbaru = $recentRkats->map(function ($rkat) {
            return [
                'unit' => $rkat->unit->nama_unit ?? 'N/A',
                'judul' => "Pengajuan RKAT dari " . ($rkat->unit->nama_unit ?? 'Unit tidak diketahui'), // Judul dinamis
                'waktu' => $rkat->updated_at->diffForHumans(), // '5 menit yang lalu'
                'status' => $this->mapStatusToFrontend($rkat->status_persetujuan), // Mapping status
            ];
        });

        // 5. Render halaman Inertia
        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'rkatTerbaru' => $rkatTerbaru,
        ]);
    }

    /**
     * Helper function untuk memetakan status database yang kompleks
     * ke status sederhana yang diharapkan oleh Dashboard.jsx.
     */
    private function mapStatusToFrontend($dbStatus)
    {
        // Sesuaikan mapping ini dengan logika bisnis Anda
        switch ($dbStatus) {
            case 'Diajukan':
            case 'Menunggu_Dekan_Kepala':
            case 'Menunggu_WR1':
            case 'Menunggu_WR2':
            case 'Menunggu_WR3':
                return 'Menunggu Persetujuan';

            case 'Disetujui_L1':
            case 'Disetujui_WR1':
            case 'Disetujui_WR2':
            case 'Disetujui_WR3':
            case 'Disetujui_Final':
                return 'Approve'; // 'Approve' sesuai di getStatusInfo()

            case 'Ditolak':
                return 'Ditolak';

            case 'Draft':
            case 'Revisi':
            default:
                return 'Pending'; // 'Pending' sesuai di getStatusInfo()
        }
    }
}