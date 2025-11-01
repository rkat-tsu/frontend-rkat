<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Iku; 
use App\Models\Ikusub; 
use App\Models\Ikk; 
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IkuController extends Controller
{
    /**
     * Menampilkan form pembuatan IKUSUB/IKK baru di bawah IKU yang sudah ada.
     */
    public function create()
    {
        // Ambil semua data IKU dengan relasi IKUSUB dan IKK yang sudah ada
        // Ini memungkinkan frontend untuk memilih IKU dan langsung menampilkan data yang sudah ada.
        $ikus = Iku::with('ikusubs.ikks')->get(['id_iku', 'nama_iku']);

        return Inertia::render('Iku/CreateIku', [
            'ikus' => $ikus, // Data IKU (beserta turunan yang sudah ada) dilempar ke frontend
        ]);
    }

    /**
     * Menyimpan IKUSUB dan IKK baru di bawah IKU yang sudah ada.
     */
    public function store(Request $request)
    {
        // 1. VALIDASI DATA
        $validated = $request->validate([
            // Validasi id_iku yang dipilih, pastikan ada di tabel 'ikus'
            'id_iku' => ['required', 'integer', 'exists:ikus,id_iku'],
            
            'ikusubs' => ['required', 'array', 'min:1'],
            'ikusubs.*.nama_ikusub' => ['required', 'string', 'max:255'],
            
            'ikusubs.*.ikks' => ['required', 'array', 'min:1'],
            'ikusubs.*.ikks.*.nama_ikk' => ['required', 'string', 'max:255'],
        ], 
        [
            'ikusubs.min' => 'Minimal harus ada satu Sub Indikator Kinerja (IKUSUB) baru.',
            'ikusubs.*.ikks.min' => 'Setiap IKUSUB baru minimal harus memiliki satu Kegiatan Kinerja (IKK).',
        ]);

        // 2. PROSES PENYIMPANAN DALAM TRANSAKSI
        DB::beginTransaction();

        try {
            $iku = Iku::find($validated['id_iku']); 

            // Simpan ID IKUSUB dan IKK yang sedang diproses untuk tujuan penghapusan
            $processedIkusubIds = [];
            $processedIkkIds = [];

            // B. Iterasi dan Simpan/Update IKUSUB
            foreach ($validated['ikusubs'] as $ikusubData) {
                
                if (isset($ikusubData['id_ikusub']) && $ikusubData['id_ikusub']) {
                    // Update IKUSUB yang sudah ada
                    $ikusub = Ikusub::find($ikusubData['id_ikusub']);
                    $ikusub->update(['nama_ikusub' => $ikusubData['nama_ikusub']]);
                    $processedIkusubIds[] = $ikusub->id_ikusub;
                } else {
                    // Buat IKUSUB baru
                    $ikusub = $iku->ikusubs()->create(['nama_ikusub' => $ikusubData['nama_ikusub']]);
                    $processedIkusubIds[] = $ikusub->id_ikusub;
                }
                
                // C. Iterasi dan Simpan/Update IKK
                foreach ($ikusubData['ikks'] as $ikkData) {
                    if (isset($ikkData['id_ikk']) && $ikkData['id_ikk']) {
                        // Update IKK yang sudah ada
                        $ikk = Ikk::find($ikkData['id_ikk']);
                        $ikk->update(['nama_ikk' => $ikkData['nama_ikk']]);
                        $processedIkkIds[] = $ikk->id_ikk;
                    } else {
                        // Buat IKK baru
                        $ikk = $ikusub->ikks()->create(['nama_ikk' => $ikkData['nama_ikk']]);
                        $processedIkkIds[] = $ikk->id_ikk;
                    }
                }
                
                // Hapus IKK yang TIDAK ADA dalam request tapi terhubung ke IKUSUB ini
                $ikusub->ikks()
                       ->whereNotIn('id_ikk', $processedIkkIds)
                       ->delete();
            }

            // Hapus IKUSUB yang TIDAK ADA dalam request tapi terhubung ke IKU ini
            $iku->ikusubs()
                ->whereNotIn('id_ikusub', $processedIkusubIds)
                ->delete();

            DB::commit();

            return redirect()
                ->route('iku.create')
                ->with('success', 'IKUSUB dan IKK baru berhasil ditambahkan ke IKU ' . $iku->nama_iku . '!')
                ->withInput();

        } catch (\Exception $e) {
            DB::rollBack();

            \Log::error('Gagal menyimpan IKUSUB/IKK: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', 'Gagal menyimpan data turunan IKU. Silakan coba lagi. Error: ' . $e->getMessage())
                ->withInput();
        }
    }
}