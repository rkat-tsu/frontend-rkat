<?php

namespace App\Http\Controllers;

use App\Models\RincianAnggaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log; // Added Log
use Illuminate\Validation\Rule;

class RincianAnggaranController extends Controller
{
    public function index()
    {
        Log::debug('[RincianAnggaran] Index page.');
        $items = RincianAnggaran::orderBy('kode_anggaran')->paginate(20);
        return Inertia::render('Admin/RincianAnggaran/Index', [
            'items' => $items,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/RincianAnggaran/Create');
    }

    public function store(Request $request)
    {
        Log::debug('[RincianAnggaran] Store Payload', $request->all());
        
        $validated = $request->validate([
            'kode_anggaran' => 'required|string|max:20|unique:rincian_anggarans,kode_anggaran',
            'nama_anggaran' => 'required|string|max:150',
            'kelompok_anggaran' => 'nullable|string|max:50',
            'pagu_limit' => 'nullable|numeric|min:0',
        ]);

        RincianAnggaran::create($validated);
        Log::info('[RincianAnggaran] Created: ' . $validated['kode_anggaran']);

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
        Log::debug('[RincianAnggaran] Update Payload', $request->all());
        
        $validated = $request->validate([
            'nama_anggaran' => 'required|string|max:150',
            'kelompok_anggaran' => 'nullable|string|max:50',
            'pagu_limit' => 'nullable|numeric|min:0',
        ]);

        $rincian->update($validated);
        Log::info('[RincianAnggaran] Updated: ' . $rincian->kode_anggaran);

        return Redirect::route('rincian.index')->with('success', 'Rincian Anggaran berhasil diperbarui.');
    }

    public function destroy(RincianAnggaran $rincian)
    {
        Log::warning('[RincianAnggaran] Deleting: ' . $rincian->kode_anggaran);
        try {
            $rincian->delete();
            return Redirect::route('rincian.index')->with('success', 'Rincian Anggaran berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('[RincianAnggaran] Delete Error: ' . $e->getMessage());
            return Redirect::route('rincian.index')->with('error', 'Gagal menghapus Rincian Anggaran.');
        }
    }
}