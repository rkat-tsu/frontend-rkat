<?php

namespace App\Http\Controllers;

use App\Models\RkatHeader;
use App\Models\TahunAnggaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $tahunSekarang = Carbon::now()->year;

        // 1. Data Ringan (Initial Load)
        $activeBudget = TahunAnggaran::query()->where('tahun_anggaran', '=', $tahunSekarang, 'and')->first();
        
        $statusMap = [
            'Drafting'   => 'Penyusunan',
            'Submission' => 'Pengajuan',
            'Approved'   => 'Disetujui',
            'Closed'     => 'Ditutup',
        ];

        $rawStatus = $activeBudget->status_rkat ?? 'None';
        $statusTeks = $statusMap[$rawStatus] ?? ($rawStatus === 'None' ? 'Tidak Aktif' : $rawStatus);

        return Inertia::render('Dashboard', [
            'tahunAnggaran' => $tahunSekarang,
            'statusAnggaran' => $statusTeks,
            'rawStatus' => $rawStatus,

            // OPTIMASI: Memuat data berat di latar belakang (Deferred)
            'summary' => Inertia::defer(fn () => $this->getOptimizedSummary()),
            'grafikRkat' => Inertia::defer(fn () => $this->getOptimizedGrafik($user, $tahunSekarang)),
        ]);
    }

    /**
     * Optimasi: Mengambil semua statistik dalam SATU kueri database saja
     */
    private function getOptimizedSummary(): array
    {
        $stats = RkatHeader::query()
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_persetujuan = 'Disetujui_Final' THEN 1 ELSE 0 END) as disetujui,
                SUM(CASE WHEN status_persetujuan = 'Ditolak' THEN 1 ELSE 0 END) as ditolak,
                SUM(CASE WHEN status_persetujuan NOT IN ('Draft', 'Selesai', 'Disetujui_Final', 'Ditolak') THEN 1 ELSE 0 END) as review
            ")
            ->first();

        return [
            'total'     => (int) ($stats->total ?? 0),
            'disetujui' => (int) ($stats->disetujui ?? 0),
            'review'    => (int) ($stats->review ?? 0),
            'ditolak'   => (int) ($stats->ditolak ?? 0),
        ];
    }

    /**
     * Optimasi: Mengambil data grafik
     */
    private function getOptimizedGrafik($user, int $tahunSekarang): array
    {
        $query = RkatHeader::query()->whereYear('tanggal_pengajuan', '=', $tahunSekarang, 'and');

        if (!$user->isAdmin()) {
            $query->where('id_unit', '=', $user->id_unit, 'and');
        }

        $rkatPerBulan = $query->selectRaw('MONTH(tanggal_pengajuan) as bulan, COUNT(*) as total')
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        $namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $grafikRkat = [];

        for ($i = 1; $i <= 12; $i++) {
            $grafikRkat[] = [
                'month' => $namaBulan[$i - 1],
                'desktop' => $rkatPerBulan[$i] ?? 0
            ];
        }

        return $grafikRkat;
    }
}
