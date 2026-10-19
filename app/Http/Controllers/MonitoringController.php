<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use App\Models\Unit;
use App\Models\RkatHeader;
use App\Models\Iku;
use App\Models\PencairanDana;
use App\Models\Lpj;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MonitoringController extends Controller
{
    /**
     * Menampilkan Dashboard Monitoring Status RKAT Seluruh Unit
     */
    public function index(Request $request)
    {
        // 1. Ambil Daftar Tahun untuk Filter sekaligus Statusnya
        $tahunOptions = TahunAnggaran::query()->select(['id_tahun', 'tahun_anggaran', 'status_rkat'])->orderBy('tahun_anggaran', 'desc')->get();

        // 2. Tentukan Tahun Anggaran (Default: Ambil dari collection yang aktif)
        $activeYear = $tahunOptions->first(fn($t) => $t->status_rkat !== 'Closed')?->tahun_anggaran ?? date('Y');
        $selectedYear = $request->input('tahun') ?: $activeYear;

        // Agregasikan angka di database agar tidak memuat seluruh RKAT, detail,
        // pencairan, item pencairan, dan LPJ ke memori sekaligus.
        $unitQuery = Unit::query()
            ->select(['id_unit', 'kode_unit', 'nama_unit', 'id_kepala'])
            ->with('kepala:id_user,nama_lengkap')
            ->orderBy('kode_unit', 'asc')
            ->get();

        $rkatStats = RkatHeader::query()
            ->where('tahun_anggaran', $selectedYear)
            ->whereNull('parent_id')
            ->select('id_unit')
            ->selectRaw("COUNT(*) as count_rkat,
                COALESCE(SUM(CASE WHEN status_persetujuan = 'Draft' THEN 1 ELSE 0 END), 0) as count_draft,
                COALESCE(SUM(CASE WHEN status_persetujuan = 'Revisi' THEN 1 ELSE 0 END), 0) as count_revisi,
                COALESCE(SUM(CASE WHEN status_persetujuan = 'Ditolak' THEN 1 ELSE 0 END), 0) as count_tolak,
                COALESCE(SUM(CASE WHEN status_persetujuan = 'Disetujui_Final' THEN 1 ELSE 0 END), 0) as count_final,
                COALESCE(SUM(CASE WHEN status_persetujuan IS NULL OR status_persetujuan NOT IN ('Draft', 'Revisi', 'Ditolak', 'Disetujui_Final') THEN 1 ELSE 0 END), 0) as count_proses,
                COALESCE(SUM(CASE WHEN total_anggaran > 0 THEN total_anggaran ELSE
                    COALESCE((SELECT SUM(rkat_details.anggaran) FROM rkat_details WHERE rkat_details.id_header = rkat_headers.id_header), 0)
                END), 0) as total_anggaran_rkat")
            ->groupBy('id_unit')
            ->get()
            ->keyBy('id_unit');

        $pencairanStats = PencairanDana::query()
            ->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header')
            ->where('rkat_headers.tahun_anggaran', $selectedYear)
            ->whereNull('rkat_headers.parent_id')
            ->select('rkat_headers.id_unit')
            ->selectRaw('COUNT(DISTINCT pencairan_danas.id_pencairan) as count_pencairan,
                COALESCE(SUM((SELECT SUM(pencairan_dana_items.sub_total_pencairan)
                    FROM pencairan_dana_items
                    WHERE pencairan_dana_items.id_pencairan = pencairan_danas.id_pencairan)), 0) as total_anggaran_pencairan')
            ->groupBy('rkat_headers.id_unit')
            ->get()
            ->keyBy('id_unit');

        $lpjStats = Lpj::query()
            ->join('pencairan_danas', 'lpjs.id_pencairan', '=', 'pencairan_danas.id_pencairan')
            ->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header')
            ->where('rkat_headers.tahun_anggaran', $selectedYear)
            ->whereNull('rkat_headers.parent_id')
            ->select('rkat_headers.id_unit')
            ->selectRaw('COUNT(DISTINCT lpjs.id_lpj) as count_laporan,
                COALESCE(SUM(lpjs.total_realisasi), 0) as total_anggaran_laporan')
            ->groupBy('rkat_headers.id_unit')
            ->get()
            ->keyBy('id_unit');

        $monitoringData = $unitQuery->map(function ($unit) use ($rkatStats, $pencairanStats, $lpjStats) {
            $rkat = $rkatStats->get($unit->id_unit);
            $pencairan = $pencairanStats->get($unit->id_unit);
            $lpj = $lpjStats->get($unit->id_unit);
            $countRkat = (int) ($rkat->count_rkat ?? 0);
            $totalAnggaranRkat = (float) ($rkat->total_anggaran_rkat ?? 0);
            $countProses = (int) ($rkat->count_proses ?? 0);
            $countFinal = (int) ($rkat->count_final ?? 0);

            return [
                'id_unit' => $unit->id_unit,
                'kode_unit' => $unit->kode_unit,
                'nama_unit' => $unit->nama_unit,
                'kepala_unit' => $unit->kepala?->nama_lengkap ?? '-',
                'count_rkat' => $countRkat,
                'total_anggaran_rkat' => $totalAnggaranRkat,
                'count_pencairan' => (int) ($pencairan->count_pencairan ?? 0),
                'total_anggaran_pencairan' => (float) ($pencairan->total_anggaran_pencairan ?? 0),
                'count_laporan' => (int) ($lpj->count_laporan ?? 0),
                'total_anggaran_laporan' => (float) ($lpj->total_anggaran_laporan ?? 0),
                'count_draft' => (int) ($rkat->count_draft ?? 0),
                'count_revisi' => (int) ($rkat->count_revisi ?? 0),
                'count_tolak' => (int) ($rkat->count_tolak ?? 0),
                'count_final' => $countFinal,
                'count_proses' => $countProses,
                'total_rkat' => $countRkat,
                'total_anggaran' => $totalAnggaranRkat,
            ];
        });

        // 4. Hitung Statistik Ringkas
        $stats = [
            'total_unit' => $monitoringData->count(),
            'sudah_submit' => $monitoringData->sum('count_proses') + $monitoringData->sum('count_final'),
            'approved' => $monitoringData->sum('count_final'),
            'total_anggaran_diajukan' => $monitoringData->sum('total_anggaran_rkat'),
        ];

        return Inertia::render('Monitoring/Index', [
            'data' => $monitoringData,
            'tahunOptions' => $tahunOptions,
            'selectedYear' => $selectedYear,
            'stats' => $stats
        ]);
    }

    /**
     * Menampilkan Dashboard Monitoring RKAT Berdasarkan IKU & IKK
     */
    public function ikuIkk(Request $request)
    {
        $tahunOptions = TahunAnggaran::query()->select(['id_tahun', 'tahun_anggaran', 'status_rkat'])->orderBy('tahun_anggaran', 'desc')->get();
        
        $activeYear = $tahunOptions->first(fn($t) => $t->status_rkat !== 'Closed')?->tahun_anggaran ?? date('Y');
        $selectedYear = $request->input('tahun') ?: $activeYear;

        $ikus = Iku::query()
            ->where(function ($query) use ($selectedYear) {
                $query->where('tahun_anggaran', $selectedYear)
                      ->orWhereNull('tahun_anggaran')
                      ->orWhereHas('ikks.rkatDetails.rkatHeader', function ($qHeader) use ($selectedYear) {
                          $qHeader->where('tahun_anggaran', $selectedYear);
                      });
            })
            ->with(['ikks' => function ($query) use ($selectedYear) {
                $query->withCount(['rkatDetails as total_anggaran' => function ($q) use ($selectedYear) {
                    $q->whereHas('rkatHeader', function ($qHeader) use ($selectedYear) {
                        $qHeader->where('tahun_anggaran', $selectedYear)
                                ->whereNotIn('status_persetujuan', ['Ditolak']);
                    })->select(DB::raw('SUM(anggaran)'));
                }]);
                
                $query->withCount(['rkatDetails as count_kegiatan' => function ($q) use ($selectedYear) {
                    $q->whereHas('rkatHeader', function ($qHeader) use ($selectedYear) {
                        $qHeader->where('tahun_anggaran', $selectedYear)
                                ->whereNotIn('status_persetujuan', ['Ditolak']);
                    });
                }]);
            }])
            ->orderBy('id_iku', 'asc')
            ->get();

        $data = $ikus->map(function ($iku) {
            $ikks = $iku->ikks->map(function ($ikk) {
                return [
                    'id_ikk' => $ikk->id_ikk,
                    'nama_ikk' => $ikk->nama_ikk,
                    'total_anggaran' => $ikk->total_anggaran ?? 0,
                    'count_kegiatan' => $ikk->count_kegiatan ?? 0,
                ];
            });

            return [
                'id_iku' => $iku->id_iku,
                'nama_iku' => $iku->nama_iku,
                'ikks' => $ikks,
                'total_anggaran_iku' => $ikks->sum('total_anggaran'),
                'count_kegiatan_iku' => $ikks->sum('count_kegiatan'),
            ];
        });

        $stats = [
            'total_iku' => $ikus->count(),
            'total_ikk' => $ikus->sum(fn($iku) => $iku->ikks->count()),
            'total_anggaran_terserap' => $data->sum('total_anggaran_iku'),
            'total_kegiatan' => $data->sum('count_kegiatan_iku'),
        ];

        return Inertia::render('Monitoring/IkuIkk', [
            'data' => $data,
            'tahunOptions' => $tahunOptions,
            'selectedYear' => $selectedYear,
            'stats' => $stats
        ]);
    }
}
