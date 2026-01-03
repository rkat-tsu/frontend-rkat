<?php

namespace App\Http\Controllers;

use App\Models\RkatRabItem;
use App\Models\RkatDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RkatRabItemController extends Controller
{
    public function index(Request $request)
    {
        $items = RkatRabItem::with('rkatDetail')->orderBy('id', 'desc')->paginate(20);
        return Inertia::render('RkatRabItem/Index', [
            'items' => $items,
        ]);
    }

    public function create()
    {
        $details = RkatDetail::select('id_rkat_detail', 'judul_kegiatan')->orderBy('id_rkat_detail', 'desc')->get();
        return Inertia::render('RkatRabItem/Create', [
            'rkatDetails' => $details,
        ]);
    }

    public function store(Request $request)
    {
        Log::debug('[RAB Item] Permintaan Simpan', $request->all());

        $validated = $request->validate([
            'id_rkat_detail' => 'required|integer|exists:rkat_details,id_rkat_detail',
            'kode_anggaran' => 'required|string',
            'deskripsi_item' => 'nullable|string',
            'volume' => 'nullable|numeric',
            'satuan' => 'required|string',
            'harga_satuan' => 'required|numeric',
        ]);

        $volume = $validated['volume'] ?? 0;
        $harga = $validated['harga_satuan'] ?? 0;
        $sub_total = ($volume * $harga);
        
        Log::debug('[RAB Item] Perhitungan', [
            'vol' => $volume,
            'price' => $harga,
            'total' => $sub_total
        ]);

        RkatRabItem::create([
            'id_rkat_detail' => $validated['id_rkat_detail'] ?? null,
            'kode_anggaran' => $validated['kode_anggaran'],
            'deskripsi_item' => $validated['deskripsi_item'] ?? null,
            'volume' => $volume,
            'satuan' => $validated['satuan'],
            'harga_satuan' => $harga,
            'sub_total' => $sub_total,
        ]);

        return redirect()->route('rkat-rab-items.index')->with('success', 'RAB item berhasil dibuat.');
    }
}