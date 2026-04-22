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

        if ($request->filled('letter')) {
            $query->where('kode_anggaran', 'like', $request->letter . '%');
        }

        $items = $query->orderBy('kode_anggaran')->paginate(20)->withQueryString();

        // Mengambil huruf depan unik dari kode_anggaran untuk dropdown filter
        $letters = RincianAnggaran::selectRaw('SUBSTR(kode_anggaran, 1, 1) as letter')
            ->whereNotNull('kode_anggaran')
            ->where('kode_anggaran', '!=', '')
            ->distinct()
            ->orderBy('letter')
            ->pluck('letter');

        return Inertia::render('Admin/RincianAnggaran/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'letter']),
            'letters' => $letters,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/RincianAnggaran/Create');
    }

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

        return Redirect::route('rincian.index')->with('success', 'Rincian Anggaran berhasil ditambahkan.');
    }

    public function edit(RincianAnggaran $rincian)
    {
        return Inertia::render('Admin/RincianAnggaran/Edit', [
            'rincian' => $rincian,
        ]);
    }

    public function update(Request $request, RincianAnggaran $rincian)
    {
        Log::debug('[RincianAnggaran] Payload Pembaruan', $request->all());
        
        $validated = $request->validate([
            'nama_anggaran' => 'required|string|max:150',
            'kelompok_anggaran' => 'nullable|string|max:50',
            'satuan' => 'nullable|string|max:50',
            'nominal' => 'nullable|numeric|min:0',
            'kelompok_anggaran' => 'nullable|string|max:50',
        ]);

        $rincian->update($validated);
        Log::info('[RincianAnggaran] Diperbarui: ' . $rincian->kode_anggaran);

        return Redirect::route('rincian.index')->with('success', 'Rincian Anggaran berhasil diperbarui.');
    }

    public function destroy(RincianAnggaran $rincian)
    {
        Log::warning('[RincianAnggaran] Menghapus: ' . $rincian->kode_anggaran);
        try {
            $rincian->delete();
            return Redirect::route('rincian.index')->with('success', 'Rincian Anggaran berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('[RincianAnggaran] Kesalahan Hapus: ' . $e->getMessage());
            return Redirect::route('rincian.index')->with('error', 'Gagal menghapus Rincian Anggaran.');
        }
    }
}