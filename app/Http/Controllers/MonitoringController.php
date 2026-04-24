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
        // 1. Tentukan Tahun Anggaran (Default: Tahun aktif atau tahun ini)
        $activeYear = TahunAnggaran::where('status_rkat', '!=', 'Closed')->value('tahun_anggaran') ?? date('Y');
        $selectedYear = $request->input('tahun', $activeYear);

        // 2. Ambil Daftar Tahun untuk Filter
        $tahunOptions = TahunAnggaran::orderBy('tahun_anggaran', 'desc')->get();

        // 3. Ambil Data Unit beserta RKAT Header-nya pada tahun terpilih
        // Kita gunakan 'leftJoin' atau relasi 'with' agar unit yang BELUM mengisi tetap muncul
        $monitoringData = Unit::orderBy('kode_unit', 'asc')
            ->with(['kepala']) // Load data kepala unit jika perlu nama
            ->get()
            ->map(function ($unit) use ($selectedYear) {
                // Cari RKAT Header unit ini di tahun terpilih
                $rkat = RkatHeader::where('id_unit', $unit->id_unit)
                    ->where('tahun_anggaran', $selectedYear)
                    ->first();

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