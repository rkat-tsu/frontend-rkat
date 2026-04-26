<?php

namespace App\Http\Controllers;

use App\Models\RkatHeader;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        // Otomatis mengambil tahun hari ini
        $tahunSekarang = Carbon::now()->year;

        // 1. Ambil Data RKAT tahun berjalan
        $query = RkatHeader::whereYear('tanggal_pengajuan', $tahunSekarang);

        // Filter data jika bukan Admin (Opsional, sesuaikan kebutuhan)
        if (!$user->isAdmin()) {
            $query->where('id_unit', $user->id_unit);
        }

        // 2. Hitung jumlah RKAT per bulan
        $rkatPerBulan = $query->selectRaw('MONTH(tanggal_pengajuan) as bulan, COUNT(*) as total')
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        // 3. Susun array 12 bulan (Jan - Des) agar grafik konsisten
        $grafikRkat = [];
        $namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        for ($i = 1; $i <= 12; $i++) {
            $grafikRkat[] = [
                'month' => $namaBulan[$i - 1],
                'desktop' => $rkatPerBulan[$i] ?? 0 // Sesuaikan key 'desktop' dengan config Shadcn
            ];
        }

        // 4. Hitung Summary untuk Card
        $summary = [
            'total' => RkatHeader::count(),
            'disetujui' => RkatHeader::where('status_persetujuan', 'Disetujui_Final')->count(),
            'review' => RkatHeader::whereNotIn('status_persetujuan', ['Draft', 'Selesai', 'Disetujui_Final', 'Ditolak'])->count(),
            'ditolak' => RkatHeader::where('status_persetujuan', 'Ditolak')->count(),
        ];

        // 5. Ambil data Tahun Anggaran Aktif & Mapping Status
        $activeBudget = \App\Models\TahunAnggaran::where('tahun_anggaran', $tahunSekarang)->first();
        
        $statusMap = [
            'Drafting'   => 'Penyusunan',
            'Submission' => 'Pengajuan',
            'Approved'   => 'Disetujui',
            'Closed'     => 'Ditutup',
        ];

        $rawStatus = $activeBudget->status_rkat ?? 'None';
        $statusTeks = $statusMap[$rawStatus] ?? ($rawStatus === 'None' ? 'Tidak Aktif' : $rawStatus);

        return Inertia::render('Dashboard', [
            'grafikRkat' => $grafikRkat,
            'tahunAnggaran' => $tahunSekarang,
            'statusAnggaran' => $statusTeks,
            'rawStatus' => $rawStatus,
            'summary' => $summary
        ]);
    }
}