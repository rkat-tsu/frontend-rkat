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
        // Mengambil IKU beserta jumlah IKK yang ada di dalamnya dengan Optimasi Memori (Select Spesifik)
        $ikus = Iku::query()
            ->select(['id_iku', 'uuid', 'nama_iku'])
            ->with(['ikks:id_ikk,id_iku,nama_ikk'])
            ->orderBy('id_iku', 'asc')
            ->get();
        
        return Inertia::render('Iku/Index', [
            'ikus' => $ikus,
        ]);
    }

    public function storeMaster(Request $request)
    {
        $rules = [
            'uuid'     => ['nullable', 'string', 'exists:ikus,uuid'],
        ];

        if ($request->filled('uuid')) {
            $iku = Iku::where('uuid', $request->uuid)->first();
            $rules['nama_iku'] = [
                'required', 
                'string', 
                'max:500', 
                \Illuminate\Validation\Rule::unique('ikus', 'nama_iku')->ignore($iku->id_iku, 'id_iku')
            ];
        } else {
            $rules['nama_iku'] = [
                'required', 
                'string', 
                'max:500', 
                'unique:ikus,nama_iku'
            ];
        }

        $validated = $request->validate($rules, [
            'nama_iku.unique' => 'Nama IKU tersebut sudah terdaftar.',
        ]);

        if (isset($validated['uuid'])) {
            // Langsung update melalui Query Builder untuk efisiensi (1 Query) dan menghindari peringatan IDE
            Iku::query()->where('uuid', $validated['uuid'])->update([
                'nama_iku' => $validated['nama_iku']
            ]);
            $message = 'Nama IKU berhasil diperbarui.';
        } else {
            Iku::create(['nama_iku' => $validated['nama_iku']]);
            $message = 'IKU baru berhasil ditambahkan.';
        }

        return redirect()->back()->with('success', $message);
    }

    public function destroy(Iku $iku)
    {
        // Gunakan Iku::destroy() untuk menghindari peringatan IDE palsu dan lebih eksplisit
        Iku::destroy($iku->id_iku); 
        return redirect()->back()->with('success', 'IKU berhasil dihapus.');
    }

    public function create()
    {
        Log::debug('[IKU] Halaman input IKU diakses.');
        
        // Mengambil semua IKU beserta IKK-nya dengan Optimasi Memori (Select Spesifik)
        $ikus = Iku::query()
            ->select(['id_iku', 'uuid', 'nama_iku'])
            ->with(['ikks:id_ikk,id_iku,nama_ikk'])
            ->orderBy('id_iku', 'asc')
            ->get();
        
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

        // 1. Validasi Input Dasar
        $request->validate([
            'uuid_iku' => ['required', 'string', 'exists:ikus,uuid'],
            'ikks' => ['required', 'array', 'min:1'],
        ], [
            'uuid_iku.required' => 'Silakan pilih IKU terlebih dahulu.',
            'ikks.min' => 'Minimal harus ada satu Indikator Kinerja Kegiatan (IKK).',
        ]);

        $iku = Iku::query()->where('uuid', $request->uuid_iku)->firstOrFail(); 
        
        // 2. Validasi IKK Khusus (Unik dalam satu IKU)
        $rules = [];
        $messages = [];
        foreach ($request->input('ikks', []) as $index => $ikkData) {
            $id = $ikkData['id_ikk'] ?? null;
            
            $uniqueRule = \Illuminate\Validation\Rule::unique('ikks', 'nama_ikk')
                ->where('id_iku', $iku->id_iku);
                
            if ($id) {
                $uniqueRule->ignore($id, 'id_ikk');
            }
            
            $rules["ikks.{$index}.nama_ikk"] = [
                'required', 
                'string', 
                'max:500', 
                'distinct',
                $uniqueRule
            ];
            $rules["ikks.{$index}.id_ikk"] = ['nullable', 'integer', 'exists:ikks,id_ikk'];
            
            $messages["ikks.{$index}.nama_ikk.required"] = 'Nama kegiatan (IKK) tidak boleh kosong.';
            $messages["ikks.{$index}.nama_ikk.distinct"] = 'Terdapat nama IKK yang sama dalam form Anda.';
            $messages["ikks.{$index}.nama_ikk.unique"] = 'Nama IKK "' . ($ikkData['nama_ikk'] ?? '') . '" sudah terdaftar di IKU ini.';
        }

        $validated = $request->validate($rules, $messages);

        DB::beginTransaction();

        try {
            Log::debug('[IKU] Memproses data untuk IKU UUID: ' . $iku->uuid);

            // Array untuk menampung ID IKK yang diproses (untuk keperluan sync/delete)
            $processedIkkIds = [];

            // 3. Loop setiap item IKK dari form
            foreach ($request->input('ikks', []) as $ikkData) {
                
                // Cek apakah ini data lama (punya ID) atau data baru
                if (isset($ikkData['id_ikk']) && $ikkData['id_ikk']) {
                    // --- UPDATE DATA LAMA ---
                    $updated = Ikk::query()
                        ->where('id_ikk', $ikkData['id_ikk'])
                        ->where('id_iku', $iku->id_iku) // Security check: Pastikan milik IKU ini
                        ->update(['nama_ikk' => $ikkData['nama_ikk']]);
                    
                    if ($updated) {
                        $processedIkkIds[] = $ikkData['id_ikk'];
                    }
                } else {
                    // --- CREATE DATA BARU ---
                    // Buat baru (sudah dijamin unik oleh validasi)
                    $ikk = $iku->ikks()->create(['nama_ikk' => $ikkData['nama_ikk']]);
                    $processedIkkIds[] = $ikk->id_ikk;
                }
            }

            // 4. Hapus IKK yang Dibuang User (Sync Logic)
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