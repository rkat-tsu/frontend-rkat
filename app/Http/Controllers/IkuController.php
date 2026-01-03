<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Iku; 
use App\Models\Ikusub; 
use App\Models\Ikk; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class IkuController extends Controller
{
    public function create()
    {
        Log::debug('[IKU] Halaman buat diakses.');
        $ikus = Iku::with('ikusubs.ikks')->get(['id_iku', 'nama_iku']);
        return Inertia::render('Iku/Create', [
            'ikus' => $ikus, 
        ]);
    }

    public function store(Request $request)
    {
        Log::debug('[IKU] Proses simpan dimulai.', ['payload' => $request->all()]);

        if ($request->boolean('debug_payload')) {
            return response()->json($request->all());
        }

        $validated = $request->validate([
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

        DB::beginTransaction();

        try {
            $iku = Iku::find($validated['id_iku']); 
            Log::debug('[IKU] Memproses IKU ID: ' . $iku->id_iku);

            $processedIkusubIds = [];

            foreach ($validated['ikusubs'] as $ikusubData) {
                $processedIkkIdsForThisIkusub = [];

                if (isset($ikusubData['id_ikusub']) && $ikusubData['id_ikusub']) {
                    $ikusub = Ikusub::find($ikusubData['id_ikusub']);
                    $ikusub->update(['nama_ikusub' => $ikusubData['nama_ikusub']]);
                    Log::debug('[IKU] Memperbarui IKUSUB ID yang ada: ' . $ikusub->id_ikusub);
                    $processedIkusubIds[] = $ikusub->id_ikusub;
                } else {
                    $existingIkusub = $iku->ikusubs()->where('nama_ikusub', $ikusubData['nama_ikusub'])->first();
                    if ($existingIkusub) {
                        $existingIkusub->update(['nama_ikusub' => $ikusubData['nama_ikusub']]);
                        $ikusub = $existingIkusub;
                        Log::debug('[IKU] Memperbarui Nama Duplikat IKUSUB ID: ' . $ikusub->id_ikusub);
                    } else {
                        $ikusub = $iku->ikusubs()->create(['nama_ikusub' => $ikusubData['nama_ikusub']]);
                        Log::debug('[IKU] Membuat IKUSUB ID Baru: ' . $ikusub->id_ikusub);
                    }
                    $processedIkusubIds[] = $ikusub->id_ikusub;
                }

                foreach ($ikusubData['ikks'] as $ikkData) {
                    if (isset($ikkData['id_ikk']) && $ikkData['id_ikk']) {
                        $ikk = Ikk::find($ikkData['id_ikk']);
                        if ($ikk) {
                            $ikk->update(['nama_ikk' => $ikkData['nama_ikk']]);
                            $processedIkkIdsForThisIkusub[] = $ikk->id_ikk;
                        }
                    } else {
                        $existingIkk = $ikusub->ikks()->where('nama_ikk', $ikkData['nama_ikk'])->first();
                        if ($existingIkk) {
                            $existingIkk->update(['nama_ikk' => $ikkData['nama_ikk']]);
                            $ikk = $existingIkk;
                        } else {
                            $ikk = $ikusub->ikks()->create(['nama_ikk' => $ikkData['nama_ikk']]);
                        }
                        $processedIkkIdsForThisIkusub[] = $ikk->id_ikk;
                    }
                }

                $deletedIkks = $ikusub->ikks()
                       ->whereNotIn('id_ikk', $processedIkkIdsForThisIkusub ?: [0])
                       ->delete();
                Log::debug("[IKU] Menghapus $deletedIkks IKK untuk IKUSUB " . $ikusub->id_ikusub);
            }

            $deletedIkusubs = $iku->ikusubs()
                ->whereNotIn('id_ikusub', $processedIkusubIds)
                ->delete();
            Log::debug("[IKU] Menghapus $deletedIkusubs IKUSUB untuk IKU " . $iku->id_iku);

            DB::commit();
            Log::debug('[IKU] Transaksi Disimpan (Committed).');

            return redirect()
                ->route('iku.create')
                ->with('success', 'IKUSUB dan IKK baru berhasil ditambahkan ke IKU ' . $iku->nama_iku . '!')
                ->withInput();

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Transaksi Gagal: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return redirect()
                ->back()
                ->with('error', 'Gagal menyimpan data turunan IKU. Silakan coba lagi. Error: ' . $e->getMessage())
                ->withInput();
        }
    }
}