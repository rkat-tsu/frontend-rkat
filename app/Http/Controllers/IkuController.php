<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Iku; 
use App\Models\Ikk; 
use App\Models\TahunAnggaran;
use App\Models\IkuChangeLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class IkuController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil daftar tahun anggaran dari tabel tahun_anggarans dan tabel ikus
        $tahunFromDb = TahunAnggaran::query()
            ->select(['id_tahun', 'tahun_anggaran', 'status_rkat'])
            ->orderBy('tahun_anggaran', 'desc')
            ->get();

        $yearsFromIkus = Iku::query()
            ->whereNotNull('tahun_anggaran')
            ->distinct()
            ->pluck('tahun_anggaran')
            ->toArray();

        $allYears = $tahunFromDb->pluck('tahun_anggaran')->merge($yearsFromIkus)->unique()->sortDesc()->values();

        $tahunOptions = $allYears->map(function ($yr) use ($tahunFromDb) {
            $matched = $tahunFromDb->firstWhere('tahun_anggaran', $yr);
            return [
                'id_tahun' => $matched?->id_tahun ?? $yr,
                'tahun_anggaran' => (int) $yr,
                'status_rkat' => $matched?->status_rkat ?? 'Drafting',
            ];
        });

        // 2. Tahun aktif default
        $activeTahun = $tahunFromDb->first(fn($t) => $t->status_rkat !== 'Closed')?->tahun_anggaran 
            ?? $tahunFromDb->first()?->tahun_anggaran 
            ?? (int) date('Y');

        // 3. Tahun terpilih dari request query parameter
        $selectedTahun = $request->filled('tahun') ? (int) $request->input('tahun') : (int) $activeTahun;

        // 4. Mengambil IKU beserta IKK sesuai tahun anggaran terpilih
        $ikus = Iku::query()
            ->where(function ($query) use ($selectedTahun) {
                $query->where('tahun_anggaran', $selectedTahun)
                      ->orWhereNull('tahun_anggaran'); // mendukung data IKU global/legacy
            })
            ->select(['id_iku', 'uuid', 'nama_iku', 'tahun_anggaran'])
            ->with(['ikks:id_ikk,id_iku,nama_ikk'])
            ->orderBy('id_iku', 'asc')
            ->get();

        // 5. Mengambil Log Perubahan (Audit Trail & Pengarsipan)
        $changeLogs = IkuChangeLog::query()
            ->with(['user:id_user,nama_lengkap,username,peran'])
            ->orderBy('created_at', 'desc')
            ->take(100)
            ->get();

        return Inertia::render('Iku/Index', [
            'ikus' => $ikus,
            'tahunOptions' => $tahunOptions,
            'selectedTahun' => $selectedTahun,
            'activeTahun' => (int) $activeTahun,
            'changeLogs' => $changeLogs,
        ]);
    }

    public function storeMaster(Request $request)
    {
        $namaIku = trim((string) $request->input('nama_iku', ''));
        $tahunAnggaran = $request->input('tahun_anggaran') ? (int) $request->input('tahun_anggaran') : (int) date('Y');
        $request->merge(['nama_iku' => $namaIku, 'tahun_anggaran' => $tahunAnggaran]);

        $uuid = $request->input('uuid');
        $existingIku = $uuid ? Iku::where('uuid', $uuid)->first() : null;

        // Pengecekan keunikan nama IKU dalam tahun anggaran yang sama (case-insensitive & trimmed)
        $duplicateQuery = Iku::query()
            ->whereRaw('LOWER(TRIM(nama_iku)) = ?', [mb_strtolower($namaIku)]);

        if ($tahunAnggaran) {
            $duplicateQuery->where(function($q) use ($tahunAnggaran) {
                $q->where('tahun_anggaran', $tahunAnggaran)->orWhereNull('tahun_anggaran');
            });
        }

        if ($existingIku) {
            $duplicateQuery->where('id_iku', '!=', $existingIku->id_iku);
        }

        if ($duplicateQuery->exists()) {
            return redirect()->back()->withErrors([
                'nama_iku' => 'Nama IKU tersebut sudah terdaftar di database.'
            ])->withInput();
        }

        $rules = [
            'uuid' => ['nullable', 'string', 'exists:ikus,uuid'],
            'nama_iku' => ['required', 'string', 'max:500'],
            'tahun_anggaran' => ['nullable', 'integer'],
        ];

        $validated = $request->validate($rules, [
            'nama_iku.required' => 'Nama IKU wajib diisi.',
        ]);

        DB::beginTransaction();
        try {
            if ($existingIku) {
                $oldNama = $existingIku->nama_iku;
                $oldTahun = $existingIku->tahun_anggaran;

                $existingIku->update([
                    'nama_iku' => $validated['nama_iku'],
                    'tahun_anggaran' => $tahunAnggaran ?? $existingIku->tahun_anggaran,
                ]);

                // Catat Log Perubahan
                IkuChangeLog::create([
                    'id_iku' => $existingIku->id_iku,
                    'id_user' => Auth::id(),
                    'tahun_anggaran' => $existingIku->tahun_anggaran,
                    'tipe_entitas' => 'IKU',
                    'aksi' => 'UPDATE',
                    'nama_entitas' => $validated['nama_iku'],
                    'ringkasan_perubahan' => "Mengubah IKU dari '{$oldNama}' menjadi '{$validated['nama_iku']}'",
                    'detail_perubahan' => [
                        'nama_lama' => $oldNama,
                        'nama_baru' => $validated['nama_iku'],
                        'tahun_lama' => $oldTahun,
                        'tahun_baru' => $existingIku->tahun_anggaran,
                    ],
                ]);

                $message = 'Nama IKU berhasil diperbarui.';
            } else {
                $newIku = Iku::create([
                    'nama_iku' => $validated['nama_iku'],
                    'tahun_anggaran' => $tahunAnggaran,
                ]);

                // Catat Log Perubahan
                IkuChangeLog::create([
                    'id_iku' => $newIku->id_iku,
                    'id_user' => Auth::id(),
                    'tahun_anggaran' => $newIku->tahun_anggaran,
                    'tipe_entitas' => 'IKU',
                    'aksi' => 'CREATE',
                    'nama_entitas' => $newIku->nama_iku,
                    'ringkasan_perubahan' => "Menambahkan IKU Baru '{$newIku->nama_iku}'" . ($newIku->tahun_anggaran ? " (Tahun {$newIku->tahun_anggaran})" : ""),
                    'detail_perubahan' => [
                        'nama_iku' => $newIku->nama_iku,
                        'tahun_anggaran' => $newIku->tahun_anggaran,
                    ],
                ]);

                $message = 'IKU baru berhasil ditambahkan.';
            }

            DB::commit();
            return redirect()->back()->with('success', $message);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Store Master Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyimpan IKU: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Menyimpan IKU Tahunan baru langsung beserta seluruh daftar IKK-nya sekaligus dalam 1 aksi
     */
    public function storeAnnual(Request $request)
    {
        $request->validate([
            'tahun_anggaran' => ['required', 'integer'],
            'nama_iku' => ['required', 'string', 'max:500'],
            'ikks' => ['nullable', 'array'],
            'ikks.*.nama_ikk' => ['nullable', 'string', 'max:500'],
        ], [
            'tahun_anggaran.required' => 'Tahun anggaran wajib dipilih.',
            'nama_iku.required' => 'Nama IKU wajib diisi.',
        ]);

        $namaIku = trim((string) $request->input('nama_iku'));
        $tahunAnggaran = (int) $request->input('tahun_anggaran');

        DB::beginTransaction();
        try {
            // Buat IKU Baru
            $iku = Iku::create([
                'nama_iku' => $namaIku,
                'tahun_anggaran' => $tahunAnggaran,
            ]);

            $createdIkks = [];
            $rawIkks = $request->input('ikks', []);

            foreach ($rawIkks as $ikkData) {
                $namaIkk = trim((string) ($ikkData['nama_ikk'] ?? ''));
                if (!empty($namaIkk)) {
                    $ikk = $iku->ikks()->create([
                        'nama_ikk' => $namaIkk,
                    ]);
                    $createdIkks[] = $ikk->nama_ikk;
                }
            }

            $countIkk = count($createdIkks);

            // Catat Log Perubahan untuk Pengarsipan
            IkuChangeLog::create([
                'id_iku' => $iku->id_iku,
                'id_user' => Auth::id(),
                'tahun_anggaran' => $tahunAnggaran,
                'tipe_entitas' => 'IKU_IKK',
                'aksi' => 'BULK_CREATE',
                'nama_entitas' => $iku->nama_iku,
                'ringkasan_perubahan' => "Menambahkan IKU Tahunan Baru '{$iku->nama_iku}' beserta {$countIkk} IKK (Tahun {$tahunAnggaran})",
                'detail_perubahan' => [
                    'nama_iku' => $iku->nama_iku,
                    'tahun_anggaran' => $tahunAnggaran,
                    'jumlah_ikk' => $countIkk,
                    'daftar_ikk' => $createdIkks,
                ],
            ]);

            DB::commit();

            return redirect()
                ->route('iku.index', ['tahun' => $tahunAnggaran])
                ->with('success', "IKU '{$iku->nama_iku}' dan {$countIkk} IKK berhasil ditambahkan untuk Tahun {$tahunAnggaran}.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Store Annual Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Iku $iku)
    {
        DB::beginTransaction();
        try {
            $namaIku = $iku->nama_iku;
            $tahunAnggaran = $iku->tahun_anggaran;
            $ikkList = $iku->ikks->pluck('nama_ikk')->toArray();
            $countIkk = count($ikkList);

            IkuChangeLog::create([
                'id_iku' => $iku->id_iku,
                'id_user' => Auth::id(),
                'tahun_anggaran' => $tahunAnggaran,
                'tipe_entitas' => 'IKU',
                'aksi' => 'DELETE',
                'nama_entitas' => $namaIku,
                'ringkasan_perubahan' => "Menghapus IKU '{$namaIku}'" . ($tahunAnggaran ? " (Tahun {$tahunAnggaran})" : "") . " beserta {$countIkk} IKK-nya",
                'detail_perubahan' => [
                    'nama_iku' => $namaIku,
                    'tahun_anggaran' => $tahunAnggaran,
                    'daftar_ikk_terhapus' => $ikkList,
                ],
            ]);

            Iku::destroy($iku->id_iku);
            DB::commit();

            return redirect()->back()->with('success', 'IKU berhasil dihapus.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Destroy Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menghapus IKU: ' . $e->getMessage());
        }
    }

    public function create()
    {
        Log::debug('[IKU] Halaman input IKU diakses.');
        
        $ikus = Iku::query()
            ->select(['id_iku', 'uuid', 'nama_iku', 'tahun_anggaran'])
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
        Log::debug('[IKU] Proses simpan IKK dimulai.', ['payload' => $request->all()]);

        $request->validate([
            'uuid_iku' => ['required', 'string', 'exists:ikus,uuid'],
            'ikks' => ['required', 'array', 'min:1'],
        ], [
            'uuid_iku.required' => 'Silakan pilih IKU terlebih dahulu.',
            'ikks.min' => 'Minimal harus ada satu Indikator Kinerja Kegiatan (IKK).',
        ]);

        $iku = Iku::query()->where('uuid', $request->uuid_iku)->firstOrFail(); 
        
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
            $oldIkks = $iku->ikks->pluck('nama_ikk')->toArray();

            $processedIkkIds = [];
            foreach ($request->input('ikks', []) as $ikkData) {
                if (isset($ikkData['id_ikk']) && $ikkData['id_ikk']) {
                    $updated = Ikk::query()
                        ->where('id_ikk', $ikkData['id_ikk'])
                        ->where('id_iku', $iku->id_iku)
                        ->update(['nama_ikk' => $ikkData['nama_ikk']]);
                    
                    if ($updated) {
                        $processedIkkIds[] = $ikkData['id_ikk'];
                    }
                } else {
                    $ikk = $iku->ikks()->create(['nama_ikk' => $ikkData['nama_ikk']]);
                    $processedIkkIds[] = $ikk->id_ikk;
                }
            }

            $deletedCount = $iku->ikks()
                ->whereNotIn('id_ikk', $processedIkkIds)
                ->delete();

            $iku->refresh();
            $newIkks = $iku->ikks->pluck('nama_ikk')->toArray();

            // Catat Log Perubahan IKK
            IkuChangeLog::create([
                'id_iku' => $iku->id_iku,
                'id_user' => Auth::id(),
                'tahun_anggaran' => $iku->tahun_anggaran,
                'tipe_entitas' => 'IKK',
                'aksi' => 'SYNC_IKK',
                'nama_entitas' => $iku->nama_iku,
                'ringkasan_perubahan' => "Memperbarui daftar IKK untuk IKU '{$iku->nama_iku}' (Total IKK: " . count($newIkks) . ")",
                'detail_perubahan' => [
                    'nama_iku' => $iku->nama_iku,
                    'ikk_sebelumnya' => $oldIkks,
                    'ikk_terbaru' => $newIkks,
                    'ikk_dihapus_count' => $deletedCount,
                ],
            ]);

            DB::commit();

            return redirect()
                ->route('iku.index', ['tahun' => $iku->tahun_anggaran])
                ->with('success', 'Daftar IKK berhasil diperbarui untuk ' . $iku->nama_iku);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Gagal Menyimpan IKK: ' . $e->getMessage());

            return redirect()
                ->back()
                ->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Menyalin data IKU dan IKK dari tahun sebelumnya ke tahun target
     */
    public function copyFromPreviousYear(Request $request)
    {
        $request->validate([
            'source_tahun' => ['required', 'integer'],
            'target_tahun' => ['required', 'integer', 'different:source_tahun'],
        ], [
            'source_tahun.required' => 'Tahun asal wajib dipilih.',
            'target_tahun.required' => 'Tahun tujuan wajib dipilih.',
            'target_tahun.different' => 'Tahun tujuan harus berbeda dari tahun asal.',
        ]);

        $sourceTahun = (int) $request->input('source_tahun');
        $targetTahun = (int) $request->input('target_tahun');

        $sourceIkus = Iku::query()
            ->where('tahun_anggaran', $sourceTahun)
            ->with('ikks')
            ->get();

        if ($sourceIkus->isEmpty()) {
            return redirect()->back()->with('error', "Tidak ada data IKU ditemukan pada Tahun {$sourceTahun}.");
        }

        DB::beginTransaction();
        try {
            $copiedIkuCount = 0;
            $copiedIkkCount = 0;

            foreach ($sourceIkus as $sourceIku) {
                // Buat IKU baru untuk target_tahun
                $newIku = Iku::create([
                    'nama_iku' => $sourceIku->nama_iku,
                    'tahun_anggaran' => $targetTahun,
                ]);
                $copiedIkuCount++;

                foreach ($sourceIku->ikks as $sourceIkk) {
                    $newIku->ikks()->create([
                        'nama_ikk' => $sourceIkk->nama_ikk,
                    ]);
                    $copiedIkkCount++;
                }
            }

            // Catat Log Perubahan
            IkuChangeLog::create([
                'id_user' => Auth::id(),
                'tahun_anggaran' => $targetTahun,
                'tipe_entitas' => 'IKU_IKK',
                'aksi' => 'COPY_YEAR',
                'nama_entitas' => "Salin IKU {$sourceTahun} -> {$targetTahun}",
                'ringkasan_perubahan' => "Menyalin {$copiedIkuCount} IKU dan {$copiedIkkCount} IKK dari Tahun {$sourceTahun} ke Tahun {$targetTahun}",
                'detail_perubahan' => [
                    'tahun_asal' => $sourceTahun,
                    'tahun_tujuan' => $targetTahun,
                    'jumlah_iku' => $copiedIkuCount,
                    'jumlah_ikk' => $copiedIkkCount,
                ],
            ]);

            DB::commit();

            return redirect()
                ->route('iku.index', ['tahun' => $targetTahun])
                ->with('success', "Berhasil menyalin {$copiedIkuCount} IKU dan {$copiedIkkCount} IKK dari Tahun {$sourceTahun} ke Tahun {$targetTahun}.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Copy Year Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal menyalin data: ' . $e->getMessage());
        }
    }

    /**
     * Update IKU beserta seluruh IKK-nya sekaligus dalam 1 transaksi DB (Unified Update)
     */
    public function updateUnified(Request $request, Iku $iku)
    {
        $request->validate([
            'tahun_anggaran' => ['required', 'integer'],
            'nama_iku' => ['required', 'string', 'max:500'],
            'ikks' => ['nullable', 'array'],
            'ikks.*.nama_ikk' => ['nullable', 'string', 'max:500'],
        ], [
            'tahun_anggaran.required' => 'Tahun anggaran wajib dipilih.',
            'nama_iku.required' => 'Nama IKU wajib diisi.',
        ]);

        $namaIku = trim((string) $request->input('nama_iku'));
        $tahunAnggaran = (int) $request->input('tahun_anggaran');

        DB::beginTransaction();
        try {
            $oldNama = $iku->nama_iku;
            $oldTahun = $iku->tahun_anggaran;
            $oldIkks = $iku->ikks->pluck('nama_ikk')->toArray();

            // 1. Update IKU
            $iku->update([
                'nama_iku' => $namaIku,
                'tahun_anggaran' => $tahunAnggaran,
            ]);

            // 2. Sync / Update IKKs
            $processedIkkIds = [];
            $newIkkNames = [];
            $rawIkks = $request->input('ikks', []);

            foreach ($rawIkks as $ikkData) {
                $namaIkk = trim((string) ($ikkData['nama_ikk'] ?? ''));
                if (!empty($namaIkk)) {
                    if (isset($ikkData['id_ikk']) && $ikkData['id_ikk']) {
                        $updated = Ikk::query()
                            ->where('id_ikk', $ikkData['id_ikk'])
                            ->where('id_iku', $iku->id_iku)
                            ->update(['nama_ikk' => $namaIkk]);
                        if ($updated) {
                            $processedIkkIds[] = $ikkData['id_ikk'];
                            $newIkkNames[] = $namaIkk;
                        }
                    } else {
                        $newIkk = $iku->ikks()->create(['nama_ikk' => $namaIkk]);
                        $processedIkkIds[] = $newIkk->id_ikk;
                        $newIkkNames[] = $namaIkk;
                    }
                }
            }

            // Hapus IKK yang dibuang oleh user
            $deletedCount = $iku->ikks()
                ->whereNotIn('id_ikk', $processedIkkIds)
                ->delete();

            // 3. Catat Log Perubahan
            IkuChangeLog::create([
                'id_iku' => $iku->id_iku,
                'id_user' => Auth::id(),
                'tahun_anggaran' => $tahunAnggaran,
                'tipe_entitas' => 'IKU_IKK',
                'aksi' => 'UPDATE',
                'nama_entitas' => $iku->nama_iku,
                'ringkasan_perubahan' => "Memperbarui IKU '{$oldNama}' dan daftar IKK-nya (Tahun {$tahunAnggaran})",
                'detail_perubahan' => [
                    'nama_lama' => $oldNama,
                    'nama_baru' => $namaIku,
                    'tahun_lama' => $oldTahun,
                    'tahun_baru' => $tahunAnggaran,
                    'ikk_sebelumnya' => $oldIkks,
                    'ikk_terbaru' => $newIkkNames,
                    'ikk_dihapus_count' => $deletedCount,
                ],
            ]);

            DB::commit();

            return redirect()
                ->route('iku.index', ['tahun' => $tahunAnggaran])
                ->with('success', "IKU '{$iku->nama_iku}' dan daftar IKK berhasil diperbarui.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[IKU] Update Unified Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Gagal memperbarui IKU: ' . $e->getMessage())->withInput();
        }
    }
}