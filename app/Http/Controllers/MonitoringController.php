<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use App\Models\Unit;
use App\Models\RkatHeader;
use App\Models\Iku;
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

        // 3. Ambil Data Unit beserta RKAT, Pencairan, dan LPJ Header-nya pada tahun terpilih
        $monitoringData = Unit::query()
            ->select(['id_unit', 'kode_unit', 'nama_unit', 'id_kepala'])
            ->orderBy('kode_unit', 'asc')
            ->with([
                'kepala:id_user,nama_lengkap',
                'rkatHeaders' => function ($query) use ($selectedYear) {
                    $query->where('tahun_anggaran', $selectedYear)
                          ->whereNull('parent_id')
                          ->with([
                              'rkatDetails',
                              'pencairanDanas.items',
                              'pencairanDanas.lpj'
                          ]);
                }
            ])
            ->get()
            ->map(function ($unit) {
                $rkats = $unit->rkatHeaders;

                // 1. RKAT (Jumlah Kegiatan & Total Anggaran RKAT)
                $count_rkat = $rkats->count();
                $total_anggaran_rkat = (float) $rkats->sum(function ($header) {
                    $tot = (float) $header->total_anggaran;
                    if ($tot > 0) return $tot;
                    return (float) ($header->rkatDetails ? $header->rkatDetails->sum('anggaran') : 0);
                });

                // 2. Pencairan (Jumlah Pencairan & Total Nominal Pencairan)
                $allPencairan = $rkats->pluck('pencairanDanas')->flatten();
                $count_pencairan = $allPencairan->count();
                $total_anggaran_pencairan = (float) $allPencairan->sum(function ($pencairan) {
                    return (float) ($pencairan->items ? $pencairan->items->sum('sub_total_pencairan') : 0);
                });

                // 3. Laporan (Jumlah LPJ & Total Realisasi LPJ)
                $allLpj = $allPencairan->pluck('lpj')->filter();
                $count_laporan = $allLpj->count();
                $total_anggaran_laporan = (float) $allLpj->sum('total_realisasi');

                return [
                    'id_unit' => $unit->id_unit,
                    'kode_unit' => $unit->kode_unit,
                    'nama_unit' => $unit->nama_unit,
                    'kepala_unit' => $unit->kepala ? $unit->kepala->nama_lengkap : '-',

                    // Metrics per kategori
                    'count_rkat' => $count_rkat,
                    'total_anggaran_rkat' => $total_anggaran_rkat,

                    'count_pencairan' => $count_pencairan,
                    'total_anggaran_pencairan' => $total_anggaran_pencairan,

                    'count_laporan' => $count_laporan,
                    'total_anggaran_laporan' => $total_anggaran_laporan,

                    // Stats persetujuan
                    'count_draft' => $rkats->where('status_persetujuan', 'Draft')->count(),
                    'count_revisi' => $rkats->where('status_persetujuan', 'Revisi')->count(),
                    'count_tolak' => $rkats->where('status_persetujuan', 'Ditolak')->count(),
                    'count_final' => $rkats->where('status_persetujuan', 'Disetujui_Final')->count(),
                    'count_proses' => $rkats->whereNotIn('status_persetujuan', ['Draft', 'Revisi', 'Ditolak', 'Disetujui_Final'])->count(),
                    
                    'total_rkat' => $count_rkat,
                    'total_anggaran' => $total_anggaran_rkat,
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
