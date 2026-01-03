<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TahunAnggaranController extends Controller
{
    public function index()
    {
        Log::debug('[TahunAnggaran] Mengambil daftar tahun anggaran.');
        $tahunAnggarans = TahunAnggaran::orderBy('tahun_anggaran', 'desc')->paginate(10);
        return Inertia::render('Admin/TahunAnggaran/Index', [
            'tahunAnggarans' => $tahunAnggarans,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/TahunAnggaran/Create');
    }

    public function store(Request $request)
    {
        Log::debug('[TahunAnggaran] Menyimpan Tahun Anggaran Baru.', $request->all());
        
        $validated = $request->validate([
            'tahun_anggaran' => 'required|integer|unique:tahun_anggarans,tahun_anggaran|min:' . (date('Y') - 1),
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
        ]);

        TahunAnggaran::create($validated);
        Log::info('[TahunAnggaran] Dibuat: ' . $validated['tahun_anggaran']);

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil ditambahkan.');
    }

    public function edit(TahunAnggaran $tahun)
    {
        return Inertia::render('Admin/TahunAnggaran/Edit', [
            'tahun' => $tahun,
        ]);
    }

    public function update(Request $request, TahunAnggaran $tahun)
    {
        Log::debug('[TahunAnggaran] Permintaan Pembaruan untuk: ' . $tahun->tahun_anggaran, $request->all());
        
        $validated = $request->validate([
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
        ]);

        $tahun->update($validated);
        Log::info('[TahunAnggaran] Berhasil Diperbarui.');

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil diperbarui.');
    }

    public function destroy(TahunAnggaran $tahun)
    {
        Log::warning('[TahunAnggaran] Mencoba menghapus: ' . $tahun->tahun_anggaran);
        try {
            $tahun->delete();
            Log::info('[TahunAnggaran] Berhasil Dihapus.');
            return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('[TahunAnggaran] Gagal Menghapus: ' . $e->getMessage());
            return Redirect::route('tahun.index')->with('error', 'Gagal menghapus tahun anggaran. Pastikan tidak ada data RKAT yang menggunakannya.');
        }
    }
}