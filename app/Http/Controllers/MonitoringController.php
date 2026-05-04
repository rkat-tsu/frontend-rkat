<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use App\Models\Unit;
use App\Models\RkatHeader;
use Illuminate\Http\Request;
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
                    ])->where('tahun_anggaran', $selectedYear);
                }
            ])
            ->get()
            ->map(function ($unit) {
                // Ambil RKAT Header unit ini yang sudah di-eager load
                $rkat = $unit->rkatHeaders->first();

                return [
                    'id_unit' => $unit->id_unit,
                    'kode_unit' => $unit->kode_unit,
                    'nama_unit' => $unit->nama_unit,
                    'kepala_unit' => $unit->kepala ? $unit->kepala->nama_lengkap : '-',

                    // Data RKAT (Bisa null jika belum buat)
                    'id_header' => $rkat ? $rkat->id_header : null,
                    'uuid' => $rkat ? $rkat->uuid : null,
                    'status' => $rkat ? $rkat->status_persetujuan : 'Belum Mengisi',
                    'total_anggaran' => $rkat ? $rkat->total_anggaran : 0,
                    'tanggal_pengajuan' => $rkat ? $rkat->tanggal_pengajuan : null,
                    'last_update' => $rkat ? $rkat->updated_at : null,
                ];
            });

        // 4. Hitung Statistik Ringkas
        $stats = [
            'total_unit' => $monitoringData->count(),
            'sudah_submit' => $monitoringData->whereNotIn('status', ['Belum Mengisi', 'Draft', 'Revisi', 'Ditolak'])->count(),
            'approved' => $monitoringData->where('status', 'Disetujui_Final')->count(),
            'total_anggaran_diajukan' => $monitoringData->sum('total_anggaran'),
        ];

        return Inertia::render('Monitoring/Index', [
            'data' => $monitoringData,
            'tahunOptions' => $tahunOptions,
            'selectedYear' => $selectedYear,
            'stats' => $stats
        ]);
    }
}
