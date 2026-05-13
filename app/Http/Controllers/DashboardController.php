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
            'summary' => Inertia::defer(fn () => $this->getOptimizedSummary($user, $tahunSekarang)),
            'grafikRkat' => Inertia::defer(fn () => $this->getOptimizedGrafik($user, $tahunSekarang)),
            'kegiatanTerdekat' => Inertia::defer(fn () => $this->getJadwalKegiatan($user, $tahunSekarang)),
        ]);
    }

    /**
     * Optimasi: Mengambil semua statistik dalam SATU kueri database saja
     */
    private function getOptimizedSummary(\App\Models\User $user, int $tahunSekarang): array
    {
        $query = RkatHeader::query()->where('tahun_anggaran', $tahunSekarang);

        if (!$user->isAdmin()) {
            $query->where('id_unit', $user->id_unit);
        }

        $stats = $query
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_persetujuan = 'Disetujui_Final' THEN 1 ELSE 0 END) as disetujui,
                SUM(CASE WHEN status_persetujuan = 'Ditolak' THEN 1 ELSE 0 END) as ditolak,
                SUM(CASE WHEN status_persetujuan NOT IN ('Draft', 'Selesai', 'Disetujui_Final', 'Ditolak') THEN 1 ELSE 0 END) as review,
                SUM(CASE WHEN status_persetujuan = 'Disetujui_Final' THEN total_anggaran ELSE 0 END) as total_anggaran_disetujui
            ")
            ->first();

        return [
            'total'     => (int) ($stats->total ?? 0),
            'disetujui' => (int) ($stats->disetujui ?? 0),
            'review'    => (int) ($stats->review ?? 0),
            'ditolak'   => (int) ($stats->ditolak ?? 0),
            'total_anggaran_disetujui' => (float) ($stats->total_anggaran_disetujui ?? 0),
        ];
    }

    /**
     * Optimasi: Mengambil data grafik
     */
    private function getOptimizedGrafik(\App\Models\User $user, int $tahunSekarang): array
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

    /**
     * Optimasi: Mengambil jadwal kegiatan terdekat dari RKAT yang disetujui
     */
    private function getJadwalKegiatan(\App\Models\User $user, int $tahunSekarang): array
    {
        $query = \App\Models\RkatDetail::query()
            ->join('rkat_headers', 'rkat_details.id_header', '=', 'rkat_headers.id_header', 'inner', false)
            ->where('rkat_headers.status_persetujuan', '=', 'Disetujui_Final', 'and')
            ->where('rkat_headers.tahun_anggaran', '=', $tahunSekarang, 'and')
            ->where('rkat_details.jadwal_pelaksanaan_mulai', '>=', Carbon::today(), 'and')
            ->orderBy('rkat_details.jadwal_pelaksanaan_mulai', 'asc')
            ->select(['rkat_details.judul_kegiatan', 'rkat_details.jadwal_pelaksanaan_mulai', 'rkat_details.jadwal_pelaksanaan_akhir'])
            ->take(5);

        if (!$user->isAdmin()) {
            $query->where('rkat_headers.id_unit', '=', $user->id_unit, 'and');
        }

        return $query->get()->map(function ($kegiatan) {
            return [
                'judul' => $kegiatan->judul_kegiatan,
                'mulai' => $kegiatan->jadwal_pelaksanaan_mulai->format('Y-m-d'),
                'akhir' => $kegiatan->jadwal_pelaksanaan_akhir->format('Y-m-d'),
            ];
        })->toArray();
    }
}
