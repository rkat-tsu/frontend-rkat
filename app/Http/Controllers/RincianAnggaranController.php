<?php

namespace App\Http\Controllers;

use App\Models\RincianAnggaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class RincianAnggaranController extends Controller
{
    public function index(Request $request)
    {
        Log::debug('[RincianAnggaran] Halaman Index.');
        
        $query = RincianAnggaran::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_anggaran', 'like', "%{$search}%")
                  ->orWhere('nama_anggaran', 'like', "%{$search}%")
                  ->orWhere('kelompok_anggaran', 'like', "%{$search}%");
            });
        }

        if ($request->filled('kelompok')) {
            $query->where('kelompok_anggaran', '=', $request->kelompok, 'and');
        }

        $perPage = request()->get('per_page', 20);
        $perPage = $perPage === 'all' ? 10000 : (int) $perPage;

        $items = $query->select(['uuid', 'kode_anggaran', 'nama_anggaran', 'kelompok_anggaran', 'nominal', 'satuan'])
            ->orderBy('kode_anggaran', 'asc')
            ->paginate($perPage)
            ->withQueryString();

        // Mengambil kelompok unik dari kelompok_anggaran untuk dropdown filter
        $kelompoks = RincianAnggaran::query()
            ->whereNotNull('kelompok_anggaran', 'and')
            ->where('kelompok_anggaran', '!=', '', 'and')
            ->select('kelompok_anggaran')
            ->distinct()
            ->orderBy('kelompok_anggaran', 'asc')
            ->pluck('kelompok_anggaran', null);

        return Inertia::render('Admin/RincianAnggaran/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'kelompok']),
            'kelompoks' => $kelompoks,
        ]);
    }

    // Modal handles create
    public function store(Request $request)
    {
        Log::debug('[RincianAnggaran] Payload Simpan', $request->all());
        
        $validated = $request->validate([
            'kode_anggaran' => 'required|string|max:20|unique:rincian_anggarans,kode_anggaran',
            'nama_anggaran' => 'required|string|max:150',
            'satuan' => 'nullable|string|max:50',
            'nominal' => 'nullable|numeric|min:0',
            'kelompok_anggaran' => 'nullable|string|max:50',
        ]);

        RincianAnggaran::create($validated);
        Log::info('[RincianAnggaran] Dibuat: ' . $validated['kode_anggaran']);

        return Redirect::route('sbo.index')->with('success', 'SBO berhasil ditambahkan.');
    }

    // Modal handles edit
    public function update(Request $request, RincianAnggaran $rincian)
    {
        Log::debug('[RincianAnggaran] Payload Pembaruan', $request->all());
        
        $validated = $request->validate([
            'nama_anggaran' => 'required|string|max:150',
            'kelompok_anggaran' => 'nullable|string|max:50',
            'satuan' => 'nullable|string|max:50',
            'nominal' => 'nullable|numeric|min:0',
        ]);

        RincianAnggaran::query()
            ->where('kode_anggaran', $rincian->kode_anggaran)
            ->update($validated);
            
        Log::info('[RincianAnggaran] Diperbarui: ' . $rincian->kode_anggaran);

        return Redirect::route('sbo.index')->with('success', 'SBO berhasil diperbarui.');
    }

    public function destroy(RincianAnggaran $rincian)
    {
        Log::warning('[RincianAnggaran] Menghapus: ' . $rincian->kode_anggaran);
        try {
            RincianAnggaran::destroy($rincian->kode_anggaran);
            return Redirect::route('sbo.index')->with('success', 'SBO berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('[RincianAnggaran] Kesalahan Hapus: ' . $e->getMessage());
            return Redirect::route('sbo.index')->with('error', 'Gagal menghapus SBO.');
        }
    }
}