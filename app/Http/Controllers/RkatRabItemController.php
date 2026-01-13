<?php

namespace App\Http\Controllers;

use App\Models\RkatRabItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class RkatRabItemController extends Controller
{
    /**
     * Menampilkan daftar semua item RAB dari seluruh unit.
     * Berguna untuk monitoring standar harga dan total belanja per item.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        
        $query = RkatRabItem::query()
            // Load relasi ke atas: Detail -> Header -> Unit
            ->with(['rkatDetail.header.unit', 'rkatDetail.header.user']);

        // Fitur Pencarian Global
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('deskripsi_item', 'like', "%{$search}%")
                  ->orWhere('kode_anggaran', 'like', "%{$search}%")
                  // Cari berdasarkan Unit Kerja
                  ->orWhereHas('rkatDetail.header.unit', function($qUnit) use ($search) {
                      $qUnit->where('nama_unit', 'like', "%{$search}%");
                  });
            });
        }

        // Urutkan dari yang terbaru
        $items = $query->latest()
            ->paginate(15)
            ->withQueryString(); // Agar parameter search tidak hilang saat ganti halaman

        return Inertia::render('RkatRabItem/Index', [
            'items' => $items,
            'filters' => $request->only(['search']),
        ]);
    }
}