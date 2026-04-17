<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TahunAnggaranController extends Controller
{
    public function index(Request $request)
    {
        $query = TahunAnggaran::query();

        if ($request->search) {
            $query->where('tahun_anggaran', 'like', "%{$request->search}%");
        }

        // Urutkan berdasarkan tahun terbaru
        $tahunAnggarans = $query->orderBy('tahun_anggaran', 'desc')->paginate(10);

        return Inertia::render('Admin/TahunAnggaran/Index', [
            'tahunAnggarans' => $tahunAnggarans,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TahunAnggaran/Create');
    }

    public function store(Request $request)
    {
        Log::info('[TahunAnggaran] Membuat data baru.');

        $validated = $request->validate([
            'tahun_anggaran' => 'required|integer|unique:tahun_anggarans,tahun_anggaran',
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
        ]);

        TahunAnggaran::create($validated);

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $tahun = TahunAnggaran::where('tahun_anggaran', $id)->firstOrFail();

        return Inertia::render('Admin/TahunAnggaran/Edit', [
            'tahun' => $tahun,
        ]);
    }

    public function update(Request $request, $id)
    {
        Log::info('[TahunAnggaran] Request Update ID: '.$id);

        $tahun = TahunAnggaran::where('id_tahun', $id)->first();

        if (! $tahun) {
            Log::error('[TahunAnggaran] Data tidak ditemukan untuk ID: '.$id);

            return Redirect::back()->with('error', 'Gagal update: Data tahun anggaran tidak ditemukan.');
        }

        $validated = $request->validate([
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
        ]);

        $tahun->update($validated);

        Log::info('[TahunAnggaran] Berhasil update data.');

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil diperbarui.');
    }

    public function destroy($id)
    {
        // Cari manual juga untuk delete
        $tahun = TahunAnggaran::where('id_tahun', $id)->first();

        if ($tahun) {
            $tahun->delete();

            return Redirect::route('tahun.index')->with('success', 'Data berhasil dihapus.');
        }

        return Redirect::back()->with('error', 'Gagal menghapus: Data tidak ditemukan.');
    }
}
