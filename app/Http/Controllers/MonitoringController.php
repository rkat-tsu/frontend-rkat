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
        // 1. Ambil Daftar Tahun untuk Filter sekaligus Statusnya (Hanya butuh 1 Query DB!)
        $tahunOptions = TahunAnggaran::query()->select(['id_tahun', 'tahun_anggaran', 'status_rkat'])->orderBy('tahun_anggaran', 'desc')->get();

        // 2. Tentukan Tahun Anggaran (Default: Ambil dari collection yang sudah di-load di memory, BUKAN query DB baru)
        // Gunakan first() dengan closure agar iterasi memori langsung berhenti saat ketemu (O(1)) dan menghindari IDE warning
        $activeYear = $tahunOptions->first(fn($t) => $t->status_rkat !== 'Closed')?->tahun_anggaran ?? date('Y');
        $selectedYear = $request->input('tahun', $activeYear);

        // 3. Ambil Data Unit beserta RKAT Header-nya pada tahun terpilih dengan Optimasi Memory (Select Spesifik)
        // Kita gunakan 'leftJoin' atau relasi 'with' agar unit yang BELUM mengisi tetap muncul
        $monitoringData = Unit::query()
            ->select(['id_unit', 'kode_unit', 'nama_unit', 'id_kepala']) // <-- Hanya pilih kolom yang benar-benar ditampilkan!
            ->orderBy('kode_unit', 'asc')
            ->with([
                'kepala:id_user,nama_lengkap', // <-- Hanya ambil ID dan Nama Lengkap Kepala Unit
                'rkatHeaders' => function ($query) use ($selectedYear) {
                    // Hanya ambil kolom RKAT yang dibutuhkan frontend (hemat ratusan KB payload)
                    $query->select([
                        'id_header',
                        'uuid',
                        'id_unit',
                        'tahun_anggaran',
                        'status_persetujuan',
                        'total_anggaran',
                        'tanggal_pengajuan',
                        'updated_at'
                    ])->where('tahun_anggaran', $selectedYear)
                      ->whereNull('parent_id');
                }
            ])
            ->get()
            ->map(function ($unit) {
                $rkats = $unit->rkatHeaders;
                
                return [
                    'id_unit' => $unit->id_unit,
                    'kode_unit' => $unit->kode_unit,
                    'nama_unit' => $unit->nama_unit,
                    'kepala_unit' => $unit->kepala ? $unit->kepala->nama_lengkap : '-',

                    // Counts
                    'count_draft' => $rkats->where('status_persetujuan', 'Draft')->count(),
                    'count_revisi' => $rkats->where('status_persetujuan', 'Revisi')->count(),
                    'count_tolak' => $rkats->where('status_persetujuan', 'Ditolak')->count(),
                    'count_final' => $rkats->where('status_persetujuan', 'Disetujui_Final')->count(),
                    'count_proses' => $rkats->whereNotIn('status_persetujuan', ['Draft', 'Revisi', 'Ditolak', 'Disetujui_Final'])->count(),
                    
                    'total_rkat' => $rkats->count(),
                    'total_anggaran' => $rkats->sum('total_anggaran'),
                ];
            });

        // 4. Hitung Statistik Ringkas
        $stats = [
            'total_unit' => $monitoringData->count(),
            'sudah_submit' => $monitoringData->sum('count_proses') + $monitoringData->sum('count_final'),
            'approved' => $monitoringData->sum('count_final'),
            'total_anggaran_diajukan' => $monitoringData->sum('total_anggaran'),
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
        $selectedYear = $request->input('tahun', $activeYear);

        $ikus = Iku::with(['ikks' => function ($query) use ($selectedYear) {
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
        }])->get();

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
