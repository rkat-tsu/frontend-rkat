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
            // PERBAIKAN: Ubah 'header' menjadi 'rkatHeader' sesuai nama fungsi di model RkatDetail
            ->with(['rkatDetail.rkatHeader.unit', 'rkatDetail.rkatHeader.user']);

        // Fitur Pencarian Global
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('deskripsi_item', 'like', "%{$search}%")
                  ->orWhere('kode_anggaran', 'like', "%{$search}%")
                  // Cari berdasarkan Unit Kerja
                  // PERBAIKAN: Ubah 'header' menjadi 'rkatHeader'
                  ->orWhereHas('rkatDetail.rkatHeader.unit', function($qUnit) use ($search) {
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