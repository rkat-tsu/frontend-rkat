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
            // A. Ambil IKU Utama yang dipilih
            $iku = Iku::find($validated['id_iku']); 

            // B. Iterasi dan Simpan IKUSUB baru di bawah IKU yang dipilih
            foreach ($validated['ikusubs'] as $ikusubData) {
                
                // $iku->ikusubs()->create() akan otomatis mengisi foreign key 'id_iku'
                $ikusub = $iku->ikusubs()->create([
                    'nama_ikusub' => $ikusubData['nama_ikusub'],
                ]);
                
                // C. Iterasi dan Simpan IKK baru di dalam IKUSUB baru
                foreach ($ikusubData['ikks'] as $ikkData) {
                    
                    // $ikusub->ikks()->create() akan otomatis mengisi foreign key 'id_ikusub'
                    $ikusub->ikks()->create([
                        'nama_ikk' => $ikkData['nama_ikk'],
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('dashboard') 
                ->with('success', 'IKUSUB dan IKK baru berhasil ditambahkan ke IKU ' . $iku->nama_iku . '!');

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