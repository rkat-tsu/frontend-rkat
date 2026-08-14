<?php

namespace App\Http\Controllers;

use App\Models\RkatHeader;
use App\Models\TahunAnggaran;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RkatRabItemController extends Controller
{
    /**
     * Halaman RKAT - Menampilkan daftar RKAT dengan Status Global (RKA, Pencairan, LPJ).
     */
    public function index(Request $request)
    {
        $query = RkatHeader::query()
            ->with([
                'unit:id_unit,kode_unit,nama_unit',
                'tahun_obj:id_tahun,tahun_anggaran,status_rkat',
                'rkatDetails:id_rkat_detail,id_header,judul_kegiatan,deskripsi_kegiatan,jadwal_pelaksanaan_mulai,jadwal_pelaksanaan_akhir,anggaran',
                'pencairanDanas:id_pencairan,id_header,status_pencairan,nama_pencairan',
                'pencairanDanas.lpj:id_lpj,id_pencairan,status_lpj'
            ])
            ->whereNull('rkat_headers.parent_id');

        // Jika pengguna bukan admin, batasi ke unit sendiri
        if (Auth::user()->peran !== 'Admin' && $request->status !== 'Disetujui_Final') {
            $query->where('rkat_headers.id_unit', Auth::user()->id_unit);
        }

        // PENCARIAN & FILTER
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('rkat_headers.nomor_dokumen', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($qUnit) use ($search) {
                        $qUnit->where('nama_unit', 'like', "%{$search}%");
                    })
                    ->orWhereHas('rkatDetails', function ($qDetail) use ($search) {
                        $qDetail->where('judul_kegiatan', 'like', "%{$search}%")
                            ->orWhere('deskripsi_kegiatan', 'like', "%{$search}%");
                    });
            });
        }
        if ($request->filled('tahun')) {
            $query->where('rkat_headers.tahun_anggaran', $request->tahun);
        }
        if ($request->filled('unit_id')) {
            $query->where('rkat_headers.id_unit', $request->unit_id);
        }

        // SORTING
        $sortBy = $request->get('sort_by', 'tanggal_pengajuan');
        $sortDirection = $request->get('sort_direction', 'desc') === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'unit') {
            $query->join('unit', 'rkat_headers.id_unit', '=', 'unit.id_unit')
                  ->orderBy('unit.nama_unit', $sortDirection)
                  ->select('rkat_headers.*');
        } elseif ($sortBy === 'pelaksanaan') {
            $query->join('rkat_details', 'rkat_headers.id_header', '=', 'rkat_details.id_header')
                  ->orderBy('rkat_details.jadwal_pelaksanaan_mulai', $sortDirection)
                  ->select('rkat_headers.*');
        } else {
            $allowedSorts = ['nomor_dokumen', 'tahun_anggaran', 'status_persetujuan', 'tanggal_pengajuan'];
            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy("rkat_headers.{$sortBy}", $sortDirection);
            } else {
                $query->orderBy('rkat_headers.tanggal_pengajuan', 'desc');
            }
        }

        $perPage = request()->get('per_page', 15);
        $perPage = $perPage === 'all' ? 10000 : (int) $perPage;

        $rkats = $query->paginate($perPage)->onEachSide(0)->withQueryString();

        $tahunAnggarans = TahunAnggaran::orderBy('tahun_anggaran', 'desc')->get();
        $units = Unit::orderBy('kode_unit', 'asc')->get();

        return Inertia::render('RkatRabItem/Index', [
            'rkats' => $rkats,
            'tahunAnggarans' => $tahunAnggarans,
            'units' => $units,
            'filters' => $request->only(['search', 'tahun', 'unit_id', 'sort_by', 'sort_direction', 'per_page']),
        ]);
    }
}