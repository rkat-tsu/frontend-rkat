<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Iku; 
use App\Models\Ikk; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class IkuController extends Controller
{

    public function index()
    {
        // Mengambil IKU beserta jumlah IKK yang ada di dalamnya
        $ikus = Iku::with('ikks')->orderBy('id_iku', 'asc')->get();
        
        return Inertia::render('Iku/Index', [
            'ikus' => $ikus,
        ]);
    }

    public function storeMaster(Request $request)
    {
        $validated = $request->validate([
            'id_iku'   => ['nullable', 'integer', 'exists:ikus,id_iku'],
            'nama_iku' => ['required', 'string', 'max:500'],
        ]);

        if (isset($validated['id_iku'])) {
            $iku = Iku::findOrFail($validated['id_iku']);
            $iku->update(['nama_iku' => $validated['nama_iku']]);
            $message = 'Nama IKU berhasil diperbarui.';
        } else {
            Iku::create(['nama_iku' => $validated['nama_iku']]);
            $message = 'IKU baru berhasil ditambahkan.';
        }

        return redirect()->back()->with('success', $message);
    }

    public function destroy(Iku $iku)
    {
        $iku->delete(); // Pastikan DB tabel IKK diset cascade on delete
        return redirect()->back()->with('success', 'IKU berhasil dihapus.');
    }

    public function create()
    {
        Log::debug('[IKU] Halaman input IKU diakses.');
        
        // Eager load 'ikks' karena sekarang relasinya langsung IKU -> IKK
        $ikus = Iku::with('ikks')->get(['id_iku', 'nama_iku']);
        
        return Inertia::render('Iku/Create', [
            'ikus' => $ikus, 
        ]);
    }

    /**
     * Menyimpan atau Memperbarui daftar IKK untuk IKU tertentu.
     */
    public function store(Request $request)
    {
        Log::debug('[IKU] Proses simpan dimulai.', ['payload' => $request->all()]);

        // 1. Validasi Input
        $validated = $request->validate([
            'id_iku' => ['required', 'integer', 'exists:ikus,id_iku'],
            
            // Validasi Array IKK
            'ikks' => ['required', 'array', 'min:1'],
            'ikks.*.nama_ikk' => ['required', 'string', 'max:500'], // Max length disesuaikan
            'ikks.*.id_ikk' => ['nullable', 'integer', 'exists:ikks,id_ikk'], // Untuk deteksi update
        ], 
        [
            'id_iku.required' => 'Silakan pilih IKU terlebih dahulu.',
            'ikks.min' => 'Minimal harus ada satu Indikator Kinerja Kegiatan (IKK).',
            'ikks.*.nama_ikk.required' => 'Nama kegiatan (IKK) tidak boleh kosong.',
        ]);

        DB::beginTransaction();

        try {
            $iku = Iku::findOrFail($validated['id_iku']); 
            Log::debug('[IKU] Memproses data untuk IKU ID: ' . $iku->id_iku);

            // Array untuk menampung ID IKK yang diproses (untuk keperluan sync/delete)
            $processedIkkIds = [];

            // 2. Loop setiap item IKK dari form
            foreach ($validated['ikks'] as $ikkData) {
                
                // Cek apakah ini data lama (punya ID) atau data baru
                if (isset($ikkData['id_ikk']) && $ikkData['id_ikk']) {
                    // --- UPDATE DATA LAMA ---
                    $ikk = Ikk::find($ikkData['id_ikk']);
                    
                    // Pastikan IKK ini benar milik IKU yang sedang diedit (Security check)
                    if ($ikk && $ikk->id_iku == $iku->id_iku) {
                        $ikk->update(['nama_ikk' => $ikkData['nama_ikk']]);
                        $processedIkkIds[] = $ikk->id_ikk;
                    }
                } else {
                    // --- CREATE DATA BARU ---
                    // Cek duplikat nama di IKU yang sama untuk menghindari double input tidak sengaja
                    $existingIkk = $iku->ikks()->where('nama_ikk', $ikkData['nama_ikk'])->first();
                    
                    if ($existingIkk) {
                        // Jika sudah ada persis, kita pakai yang lama (update nama saja jika perlu)
                        $existingIkk->update(['nama_ikk' => $ikkData['nama_ikk']]);
                        $ikk = $existingIkk;
                    } else {
                        // Buat baru
                        $ikk = $iku->ikks()->create(['nama_ikk' => $ikkData['nama_ikk']]);
                    }
                    $processedIkkIds[] = $ikk->id_ikk;
                }
            }

            // 3. Hapus IKK yang Dibuang User (Sync Logic)
            // Hapus semua IKK milik IKU ini yang ID-nya TIDAK ada dalam daftar yang baru saja diproses
            $deletedCount = $iku->ikks()
                ->whereNotIn('id_ikk', $processedIkkIds)
                ->delete();
            
            if ($deletedCount > 0) {
                Log::info("[IKU] Menghapus $deletedCount IKK usang pada IKU " . $iku->id_iku);
            }

            DB::commit();
            Log::info('[IKU] Data Berhasil Disimpan.');

            return redirect()
                ->route('iku.index') // <--- SAYA UBAH KE INDEX AGAR KEMBALI KE TABEL MASTER SETELAH SAVE
                ->with('success', 'Daftar IKK berhasil diperbarui untuk ' . $iku->nama_iku);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Gagal Menyimpan: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage())
                ->withInput();
        }
    }
}