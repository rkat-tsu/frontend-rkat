<?php

namespace App\Http\Controllers;

use App\Models\RkatHeader;
use App\Models\TahunAnggaran;
use App\Models\RkatDetail;
use App\Models\PencairanDana;
use App\Models\Lpj;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Data Tahun Anggaran untuk Filter
        $tahunOptions = TahunAnggaran::query()
            ->select(['id_tahun', 'tahun_anggaran', 'status_rkat'])
            ->orderBy('tahun_anggaran', 'desc')
            ->get();

        // 2. Tentukan Tahun yang Dipilih
        $activeYearFromDb = $tahunOptions->first(fn($t) => $t->status_rkat !== 'Closed')?->tahun_anggaran
            ?? $tahunOptions->first()?->tahun_anggaran
            ?? Carbon::now()->year;

        $selectedYear = $request->has('tahun') && is_numeric($request->input('tahun'))
            ? (int) $request->input('tahun')
            : (int) $activeYearFromDb;

        // Ambil status budget untuk tahun terpilih
        $activeBudget = $tahunOptions->firstWhere('tahun_anggaran', $selectedYear);
        if (!$activeBudget) {
            $activeBudget = TahunAnggaran::query()->where('tahun_anggaran', $selectedYear)->first();
        }

        $statusMap = [
            'Drafting'   => 'Penyusunan',
            'Submission' => 'Pengajuan',
            'Approved'   => 'Disetujui',
            'Closed'     => 'Ditutup',
        ];

        $rawStatus = $activeBudget->status_rkat ?? 'None';
        $statusTeks = $statusMap[$rawStatus] ?? ($rawStatus === 'None' ? 'Tidak Aktif' : $rawStatus);

        // Ambil info unit pengaju (jika bukan admin)
        $unitInfo = null;
        if (!$user->isAdmin() && $user->id_unit) {
            $user->loadMissing('unit');
            $unitInfo = $user->unit ? [
                'id_unit' => $user->unit->id_unit,
                'kode_unit' => $user->unit->kode_unit,
                'nama_unit' => $user->unit->nama_unit,
            ] : null;
        }

        return Inertia::render('Dashboard', [
            'tahunAnggaran' => $selectedYear,
            'tahunOptions' => $tahunOptions->map(fn($t) => [
                'id_tahun' => $t->id_tahun,
                'tahun' => (int) $t->tahun_anggaran,
                'status' => $t->status_rkat,
                'status_label' => $statusMap[$t->status_rkat] ?? $t->status_rkat,
            ])->values()->toArray(),
            'statusAnggaran' => $statusTeks,
            'rawStatus' => $rawStatus,
            'unitInfo' => $unitInfo,

            // OPTIMASI: Memuat data berat di latar belakang (Deferred)
            'summary' => Inertia::defer(fn() => $this->getOptimizedSummary($user, $selectedYear)),
            'grafikRkat' => Inertia::defer(fn() => $this->getOptimizedGrafik($user, $selectedYear)),
            'kegiatanTerdekat' => Inertia::defer(fn() => $this->getJadwalKegiatan($user, $selectedYear)),
        ]);
    }

    /**
     * Optimasi: Mengambil semua statistik dalam SATU kueri database saja
     */
    private function getOptimizedSummary(User $user, int $tahunSekarang): array
    {
        $query = RkatHeader::query()->where('tahun_anggaran', $tahunSekarang);

        if (!$user->isAdmin()) {
            $query->where('id_unit', $user->id_unit);
        }

        $stats = $query
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN status_persetujuan = 'Disetujui_Final' THEN 1 ELSE 0 END) as disetujui,
                SUM(CASE WHEN status_persetujuan = 'Revisi' THEN 1 ELSE 0 END) as revisi,
                SUM(CASE WHEN status_persetujuan = 'Ditolak' THEN 1 ELSE 0 END) as ditolak,
                SUM(CASE WHEN status_persetujuan NOT IN ('Draft', 'Selesai', 'Disetujui_Final', 'Revisi', 'Ditolak') THEN 1 ELSE 0 END) as review,
                SUM(CASE WHEN status_persetujuan = 'Disetujui_Final' THEN total_anggaran ELSE 0 END) as total_anggaran_disetujui
            ")
            ->first();

        $pencairanQuery = PencairanDana::query()
            ->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header', 'inner', false)
            ->where('rkat_headers.tahun_anggaran', $tahunSekarang);

        if (!$user->isAdmin()) {
            $pencairanQuery->where('rkat_headers.id_unit', $user->id_unit);
        }

        $pencairanStats = $pencairanQuery
            ->selectRaw("
                COUNT(pencairan_danas.id_pencairan) as total_pencairan_dokumen,
                SUM(CASE WHEN pencairan_danas.status_pencairan = 'Disetujui_Final' THEN 1 ELSE 0 END) as pencairan_disetujui,
                SUM(CASE WHEN pencairan_danas.status_pencairan = 'Revisi' THEN 1 ELSE 0 END) as pencairan_revisi,
                SUM(CASE WHEN pencairan_danas.status_pencairan = 'Ditolak' THEN 1 ELSE 0 END) as pencairan_ditolak,
                SUM(CASE WHEN pencairan_danas.status_pencairan NOT IN ('Draft', 'Disetujui_Final', 'Revisi', 'Ditolak') THEN 1 ELSE 0 END) as pencairan_review,
                SUM(CASE WHEN pencairan_danas.status_pencairan = 'Disetujui_Final' THEN (SELECT SUM(sub_total_pencairan) FROM pencairan_dana_items WHERE pencairan_dana_items.id_pencairan = pencairan_danas.id_pencairan) ELSE 0 END) as total_pencairan_disetujui
            ")
            ->first();

        $lpjQuery = Lpj::query()
            ->join('pencairan_danas', 'lpjs.id_pencairan', '=', 'pencairan_danas.id_pencairan', 'inner', false)
            ->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header', 'inner', false)
            ->where('rkat_headers.tahun_anggaran', $tahunSekarang);

        if (!$user->isAdmin()) {
            $lpjQuery->where('rkat_headers.id_unit', $user->id_unit);
        }

        $lpjStats = $lpjQuery
            ->selectRaw("
                COUNT(lpjs.id_lpj) as total_lpj_dokumen,
                SUM(CASE WHEN lpjs.status_lpj IN ('Disetujui', 'Disetujui_Final') THEN 1 ELSE 0 END) as lpj_disetujui,
                SUM(CASE WHEN lpjs.status_lpj = 'Revisi' THEN 1 ELSE 0 END) as lpj_revisi,
                SUM(CASE WHEN lpjs.status_lpj = 'Ditolak' THEN 1 ELSE 0 END) as lpj_ditolak,
                SUM(CASE WHEN lpjs.status_lpj NOT IN ('Draft', 'Disetujui', 'Disetujui_Final', 'Revisi', 'Ditolak') THEN 1 ELSE 0 END) as lpj_review,
                SUM(CASE WHEN lpjs.status_lpj IN ('Disetujui', 'Disetujui_Final') THEN lpjs.total_realisasi ELSE 0 END) as total_lpj_realisasi
            ")
            ->first();

        $totalAnggaranDisetujui = (float) ($stats->total_anggaran_disetujui ?? 0);
        $totalPencairanDisetujui = (float) ($pencairanStats->total_pencairan_disetujui ?? 0);
        $totalLpjRealisasi = (float) ($lpjStats->total_lpj_realisasi ?? 0);

        $persentasePencairan = $totalAnggaranDisetujui > 0 ? round(($totalPencairanDisetujui / $totalAnggaranDisetujui) * 100, 1) : 0;
        $persentaseLpj = $totalPencairanDisetujui > 0 ? round(($totalLpjRealisasi / $totalPencairanDisetujui) * 100, 1) : 0;
        $persentaseTotalRealisasi = $totalAnggaranDisetujui > 0 ? round(($totalLpjRealisasi / $totalAnggaranDisetujui) * 100, 1) : 0;

        return [
            'total'     => (int) ($stats->total ?? 0),
            'disetujui' => (int) ($stats->disetujui ?? 0),
            'revisi'    => (int) ($stats->revisi ?? 0),
            'review'    => (int) ($stats->review ?? 0),
            'ditolak'   => (int) ($stats->ditolak ?? 0),
            'total_anggaran_disetujui' => $totalAnggaranDisetujui,

            'total_pencairan_dokumen'  => (int) ($pencairanStats->total_pencairan_dokumen ?? 0),
            'pencairan_disetujui'      => (int) ($pencairanStats->pencairan_disetujui ?? 0),
            'pencairan_revisi'         => (int) ($pencairanStats->pencairan_revisi ?? 0),
            'pencairan_ditolak'        => (int) ($pencairanStats->pencairan_ditolak ?? 0),
            'pencairan_review'         => (int) ($pencairanStats->pencairan_review ?? 0),
            'total_pencairan_disetujui'=> $totalPencairanDisetujui,

            'total_lpj_dokumen'        => (int) ($lpjStats->total_lpj_dokumen ?? 0),
            'lpj_disetujui'            => (int) ($lpjStats->lpj_disetujui ?? 0),
            'lpj_revisi'               => (int) ($lpjStats->lpj_revisi ?? 0),
            'lpj_ditolak'              => (int) ($lpjStats->lpj_ditolak ?? 0),
            'lpj_review'               => (int) ($lpjStats->lpj_review ?? 0),
            'total_lpj_realisasi'      => $totalLpjRealisasi,

            // Metrik Keuangan & Penyerapan Tambahan
            'persentase_pencairan'       => $persentasePencairan,
            'persentase_lpj'             => $persentaseLpj,
            'persentase_total_realisasi' => $persentaseTotalRealisasi,
            'sisa_anggaran_belum_dicairkan' => max(0, $totalAnggaranDisetujui - $totalPencairanDisetujui),
            'sisa_pencairan_belum_dilpj'    => max(0, $totalPencairanDisetujui - $totalLpjRealisasi),

            // Perhatian & Tindak Lanjut
            'total_butuh_revisi' => (int) ($stats->revisi ?? 0) + (int) ($pencairanStats->pencairan_revisi ?? 0) + (int) ($lpjStats->lpj_revisi ?? 0),
            'total_dalam_review' => (int) ($stats->review ?? 0) + (int) ($pencairanStats->pencairan_review ?? 0) + (int) ($lpjStats->lpj_review ?? 0),
        ];
    }

    /**
     * Optimasi: Mengambil data grafik bulanan (RKAT, Pencairan, LPJ)
     */
    private function getOptimizedGrafik(User $user, int $tahunSekarang): array
    {
        // 1. Data RKAT per bulan
        $queryRkat = RkatHeader::query()->where('tahun_anggaran', '=', $tahunSekarang, 'and');
        if (!$user->isAdmin()) {
            $queryRkat->where('id_unit', '=', $user->id_unit, 'and');
        }
        $rkatPerBulan = $queryRkat->selectRaw('MONTH(tanggal_pengajuan) as bulan, COUNT(*) as total')
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        // 2. Data Pencairan per bulan
        $queryPencairan = PencairanDana::query()
            ->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header')
            ->where('rkat_headers.tahun_anggaran', '=', $tahunSekarang);
        if (!$user->isAdmin()) {
            $queryPencairan->where('rkat_headers.id_unit', '=', $user->id_unit);
        }
        $pencairanPerBulan = $queryPencairan->selectRaw('MONTH(pencairan_danas.tanggal_pengajuan) as bulan, COUNT(*) as total')
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        // 3. Data LPJ per bulan
        $queryLpj = Lpj::query()
            ->join('pencairan_danas', 'lpjs.id_pencairan', '=', 'pencairan_danas.id_pencairan')
            ->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header')
            ->where('rkat_headers.tahun_anggaran', '=', $tahunSekarang);
        if (!$user->isAdmin()) {
            $queryLpj->where('rkat_headers.id_unit', '=', $user->id_unit);
        }
        $lpjPerBulan = $queryLpj->selectRaw('MONTH(lpjs.tanggal_pengajuan) as bulan, COUNT(*) as total')
            ->groupBy('bulan')
            ->pluck('total', 'bulan')
            ->toArray();

        $namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $grafikData = [];

        for ($i = 1; $i <= 12; $i++) {
            $grafikData[] = [
                'month' => $namaBulan[$i - 1],
                'desktop' => $rkatPerBulan[$i] ?? 0,
                'rkat' => $rkatPerBulan[$i] ?? 0,
                'pencairan' => $pencairanPerBulan[$i] ?? 0,
                'lpj' => $lpjPerBulan[$i] ?? 0,
            ];
        }

        return $grafikData;
    }

    /**
     * Optimasi: Mengambil jadwal kegiatan terdekat dari RKAT yang disetujui
     */
    private function getJadwalKegiatan(User $user, int $tahunSekarang): array
    {
        $query = RkatDetail::query()
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
