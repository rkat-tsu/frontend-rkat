<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use App\Support\DatabaseErrorMessage;
use App\Models\Unit;
use App\Models\JenisKegiatanOption;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Concerns\PreservesPagination;

class KaryawanController extends Controller
{
    use PreservesPagination;

    public function index(Request $request)
    {
        $this->rememberPaginationQuery($request, 'karyawan');
        Log::debug('[Karyawan] Halaman Index SDM.');

        $query = Karyawan::query()->with(['unit:id_unit,kode_unit,nama_unit']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('jabatan', 'like', "%{$search}%")
                  ->orWhere('nidn', 'like', "%{$search}%")
                  ->orWhere('nuptk', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('unit', function ($uq) use ($search) {
                      $uq->where('nama_unit', 'like', "%{$search}%")
                         ->orWhere('kode_unit', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('unit_id')) {
            $query->where('id_unit', $request->unit_id);
        }

        if ($request->filled('status_pegawai')) {
            $query->where('status_pegawai', $request->status_pegawai);
        }

        if ($request->filled('status_aktif')) {
            $query->where('is_aktif', $request->status_aktif === '1' || $request->status_aktif === 'true');
        }

        $perPage = request()->get('per_page', 15);
        $perPage = $perPage === 'all' ? 10000 : (int) $perPage;

        $sortBy = $request->input('sort_by', 'nama');
        $sortDirection = $request->input('sort_direction', 'asc');

        if (in_array($sortBy, ['nik', 'nama', 'email', 'jabatan', 'status_pegawai', 'is_aktif', 'nidn', 'nuptk'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('nama', 'asc');
        }

        $karyawans = $query->paginate($perPage)->onEachSide(0)->withQueryString();

        $units = Unit::query()->select(['id_unit', 'kode_unit', 'nama_unit'])->orderBy('nama_unit', 'asc')->get();

        return Inertia::render('Admin/Karyawan/Index', [
            'karyawans' => $karyawans,
            'units' => $units,
            'statusPegawaiOptions' => JenisKegiatanOption::query()
                ->where('kode_grup', 'status_pegawai')
                ->orderBy('nama')
                ->get(['nama', 'is_active']),
            'filters' => $request->only(['search', 'unit_id', 'status_pegawai', 'status_aktif', 'per_page', 'sort_by', 'sort_direction']),
        ]);
    }

    public function store(Request $request)
    {
        Log::debug('[Karyawan] Payload Simpan', $request->all());

        $validated = $request->validate([
            'nik' => 'nullable|string|max:50|unique:karyawans,nik',
            'nama' => 'required|string|max:150',
            'email' => 'nullable|email|max:150',
            'no_telepon' => 'nullable|string|max:30',
            'id_unit' => 'nullable|exists:unit,id_unit',
            'jabatan' => 'nullable|string|max:100',
            'status_pegawai' => ['required', 'string', 'max:50', Rule::exists('jenis_kegiatan_options', 'nama')->where('kode_grup', 'status_pegawai')->where('is_active', true)],
            'is_aktif' => 'boolean',
            'nidn' => 'nullable|string|max:50',
            'nuptk' => 'nullable|string|max:50',
        ]);

        Karyawan::create($validated);
        Log::info('[Karyawan] Dibuat: ' . $validated['nama']);

        return $this->redirectToPaginatedList($request, 'karyawan', 'karyawan.index')->with('success', 'Data SDM / Karyawan berhasil ditambahkan.');
    }

    public function update(Request $request, Karyawan $karyawan)
    {
        Log::debug('[Karyawan] Payload Pembaruan', $request->all());

        $validated = $request->validate([
            'nik' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('karyawans', 'nik')->ignore($karyawan->id_karyawan, 'id_karyawan'),
            ],
            'nama' => 'required|string|max:150',
            'email' => 'nullable|email|max:150',
            'no_telepon' => 'nullable|string|max:30',
            'id_unit' => 'nullable|exists:unit,id_unit',
            'jabatan' => 'nullable|string|max:100',
            'status_pegawai' => ['required', 'string', 'max:50', Rule::exists('jenis_kegiatan_options', 'nama')->where('kode_grup', 'status_pegawai')],
            'is_aktif' => 'boolean',
            'nidn' => 'nullable|string|max:50',
            'nuptk' => 'nullable|string|max:50',
        ]);

        $karyawan->update($validated);
        Log::info('[Karyawan] Diperbarui: ' . $karyawan->nama);

        return $this->redirectToPaginatedList($request, 'karyawan', 'karyawan.index')->with('success', 'Data SDM / Karyawan berhasil diperbarui.');
    }

    public function destroy(Request $request, Karyawan $karyawan)
    {
        Log::warning('[Karyawan] Menghapus: ' . $karyawan->nama);
        try {
            $karyawan->delete();
            return $this->redirectToPaginatedList($request, 'karyawan', 'karyawan.index')->with('success', 'Data SDM / Karyawan berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('[Karyawan] Kesalahan Hapus: ' . $e->getMessage());
            return $this->redirectToPaginatedList($request, 'karyawan', 'karyawan.index')->with('error', 'Gagal menghapus data SDM.');
        }
    }

    public function import(Request $request)
    {
        Log::info('[Karyawan] Memulai impor dokumen karyawan.');

        if ($request->user() && $request->user()->peran !== 'Admin') {
            abort(403, 'Hanya Admin yang memiliki hak akses untuk mengimpor data SDM.');
        }

        $rows = $request->input('rows');
        $replaceExisting = $request->boolean('replace_existing', true);

        // If rows not provided in body, check for CSV file upload
        if (empty($rows) && $request->hasFile('file')) {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());
            if ($extension === 'csv' || $extension === 'txt') {
                $rows = $this->parseCsvFile($file->getPathname());
            } else {
                return back()->with('error', 'Format berkas unggahan langsung harus berupa CSV. Untuk file Excel (.xlsx / .xls), silakan gunakan form impor antarmuka.');
            }
        }

        if (empty($rows) || !is_array($rows)) {
            return back()->with('error', 'Tidak ada data valid yang ditemukan untuk diimpor.');
        }

        // Preload Units
        $units = Unit::all();
        $unitLookup = [];
        foreach ($units as $u) {
            if ($u->kode_unit) {
                $unitLookup[strtoupper(trim($u->kode_unit))] = $u->id_unit;
            }
            if ($u->nama_unit) {
                $unitLookup[strtoupper(trim($u->nama_unit))] = $u->id_unit;
            }
            $unitLookup[(string) $u->id_unit] = $u->id_unit;
        }

        // Preload Status Pegawai options
        $statusOptions = JenisKegiatanOption::where('kode_grup', 'status_pegawai')
            ->pluck('nama')
            ->all();
        $statusLookup = [];
        foreach ($statusOptions as $opt) {
            $statusLookup[strtolower(trim($opt))] = $opt;
        }

        // Collect identifiers to preload existing Karyawan records
        $cleanNiks = [];
        $cleanNidns = [];
        $cleanNuptks = [];
        $cleanEmails = [];

        $cleanNames = [];

        foreach ($rows as $row) {
            $normalized = $this->normalizeRowKeys($row);
            if (!empty($normalized['nik'])) $cleanNiks[] = trim((string) $normalized['nik']);
            if (!empty($normalized['nidn'])) $cleanNidns[] = trim((string) $normalized['nidn']);
            if (!empty($normalized['nuptk'])) $cleanNuptks[] = trim((string) $normalized['nuptk']);
            if (!empty($normalized['email'])) $cleanEmails[] = strtolower(trim((string) $normalized['email']));
            if (!empty($normalized['nama'])) $cleanNames[] = strtolower(trim((string) $normalized['nama']));
        }

        $cleanNiks = array_values(array_unique(array_filter($cleanNiks)));
        $cleanNidns = array_values(array_unique(array_filter($cleanNidns)));
        $cleanNuptks = array_values(array_unique(array_filter($cleanNuptks)));
        $cleanEmails = array_values(array_unique(array_filter($cleanEmails)));
        $cleanNames = array_values(array_unique(array_filter($cleanNames)));

        $existingQuery = Karyawan::query();
        $hasCond = false;
        if (!empty($cleanNiks)) {
            $existingQuery->whereIn('nik', $cleanNiks);
            $hasCond = true;
        }
        if (!empty($cleanNidns)) {
            $hasCond ? $existingQuery->orWhereIn('nidn', $cleanNidns) : $existingQuery->whereIn('nidn', $cleanNidns);
            $hasCond = true;
        }
        if (!empty($cleanNuptks)) {
            $hasCond ? $existingQuery->orWhereIn('nuptk', $cleanNuptks) : $existingQuery->whereIn('nuptk', $cleanNuptks);
            $hasCond = true;
        }
        if (!empty($cleanEmails)) {
            $hasCond ? $existingQuery->orWhereIn('email', $cleanEmails) : $existingQuery->whereIn('email', $cleanEmails);
            $hasCond = true;
        }
        if (!empty($cleanNames)) {
            $hasCond ? $existingQuery->orWhereIn('nama', $cleanNames) : $existingQuery->whereIn('nama', $cleanNames);
            $hasCond = true;
        }

        $existingList = $hasCond ? $existingQuery->get() : collect();

        $mapByNik = [];
        $mapByNidn = [];
        $mapByNuptk = [];
        $mapByEmail = [];
        $mapByName = [];

        foreach ($existingList as $emp) {
            $existingNik = $this->cleanImportIdentifier($emp->nik);
            $existingNidn = $this->cleanImportIdentifier($emp->nidn);
            $existingNuptk = $this->cleanImportIdentifier($emp->nuptk);
            $existingEmail = $this->cleanImportIdentifier($emp->email);
            if ($existingNik !== null) $mapByNik[$existingNik] = $emp;
            if ($existingNidn !== null) $mapByNidn[$existingNidn] = $emp;
            if ($existingNuptk !== null) $mapByNuptk[$existingNuptk] = $emp;
            if ($existingEmail !== null) $mapByEmail[strtolower($existingEmail)] = $emp;
            if (!empty($emp->nama)) $mapByName[strtolower(trim((string) $emp->nama))] = $emp;
        }

        $insertedCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;
        $errorDetails = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $rawRow) {
                $rowNum = $index + 2; // Mengasumsikan baris 1 adalah header
                $row = $this->normalizeRowKeys($rawRow);

                $nama = trim((string) ($row['nama'] ?? ''));
                if (empty($nama)) {
                    $skippedCount++;
                    $errorDetails[] = "Baris #{$rowNum}: Kolom Nama Lengkap kosong.";
                    continue;
                }

                $nik = $this->cleanImportIdentifier($row['nik'] ?? null);
                $nidn = $this->cleanImportIdentifier($row['nidn'] ?? null);
                $nuptk = $this->cleanImportIdentifier($row['nuptk'] ?? null);
                $emailValue = $this->cleanImportIdentifier($row['email'] ?? null);
                $email = $emailValue !== null ? strtolower($emailValue) : null;
                $noTelepon = !empty($row['no_telepon']) ? trim((string) $row['no_telepon']) : null;
                $jabatan = !empty($row['jabatan']) ? trim((string) $row['jabatan']) : null;

                // Resolve Unit
                $idUnit = null;
                if (!empty($row['id_unit'])) {
                    $idUnit = (int) $row['id_unit'];
                } elseif (!empty($row['unit'])) {
                    $rawUnit = strtoupper(trim((string) $row['unit']));
                    if (isset($unitLookup[$rawUnit])) {
                        $idUnit = $unitLookup[$rawUnit];
                    } else {
                        // Coba pencocokan parsial kode/nama unit
                        foreach ($units as $u) {
                            $codeUpper = strtoupper($u->kode_unit ?? '');
                            $nameUpper = strtoupper($u->nama_unit ?? '');
                            if (($codeUpper && str_contains($rawUnit, $codeUpper)) ||
                                ($nameUpper && str_contains($rawUnit, $nameUpper))) {
                                $idUnit = $u->id_unit;
                                break;
                            }
                        }
                    }
                }

                // Resolve Status Pegawai
                $rawStatus = trim((string) ($row['status_pegawai'] ?? ''));
                $statusPegawai = 'Tetap';
                if (!empty($rawStatus)) {
                    $lowerStatus = strtolower($rawStatus);
                    if (isset($statusLookup[$lowerStatus])) {
                        $statusPegawai = $statusLookup[$lowerStatus];
                    } else {
                        $statusPegawai = $rawStatus;
                    }
                }

                // Resolve Status Aktif
                $isAktif = true;
                if (isset($row['is_aktif'])) {
                    $val = $row['is_aktif'];
                    if (is_bool($val)) {
                        $isAktif = $val;
                    } else {
                        $strVal = strtolower(trim((string) $val));
                        if (in_array($strVal, ['0', 'false', 'nonaktif', 'tidak', 't', 'non-aktif'], true)) {
                            $isAktif = false;
                        }
                    }
                }

                // Identifikasi apakah data karyawan sudah ada
                $existing = null;
                if ($nik && isset($mapByNik[$nik])) {
                    $existing = $mapByNik[$nik];
                } elseif ($nidn && isset($mapByNidn[$nidn])) {
                    $existing = $mapByNidn[$nidn];
                } elseif ($nuptk && isset($mapByNuptk[$nuptk])) {
                    $existing = $mapByNuptk[$nuptk];
                } elseif ($email && isset($mapByEmail[$email])) {
                    $existing = $mapByEmail[$email];
                } elseif ($nama && isset($mapByName[strtolower($nama)])) {
                    $existing = $mapByName[strtolower($nama)];
                }

                if ($existing && $replaceExisting) {
                    // Update / replace data yang ada
                    $updatePayload = [
                        'nama' => $nama,
                        'status_pegawai' => $statusPegawai,
                        'is_aktif' => $isAktif,
                    ];
                    if ($nik !== null) $updatePayload['nik'] = $nik;
                    if ($email !== null) $updatePayload['email'] = $email;
                    if ($noTelepon !== null) $updatePayload['no_telepon'] = $noTelepon;
                    if ($idUnit !== null) $updatePayload['id_unit'] = $idUnit;
                    if ($jabatan !== null) $updatePayload['jabatan'] = $jabatan;
                    if ($nidn !== null) $updatePayload['nidn'] = $nidn;
                    if ($nuptk !== null) $updatePayload['nuptk'] = $nuptk;

                    $existing->update($updatePayload);
                    $updatedCount++;
                } elseif (!$existing) {
                    // Buat karyawan baru
                    $newKaryawan = Karyawan::create([
                        'nik' => $nik,
                        'nama' => $nama,
                        'email' => $email,
                        'no_telepon' => $noTelepon,
                        'id_unit' => $idUnit,
                        'jabatan' => $jabatan,
                        'status_pegawai' => $statusPegawai,
                        'is_aktif' => $isAktif,
                        'nidn' => $nidn,
                        'nuptk' => $nuptk,
                    ]);
                    $insertedCount++;

                    // Simpan ke in-memory map agar baris selanjutnya dengan id yang sama tidak terduplikasi
                    if ($nik) $mapByNik[$nik] = $newKaryawan;
                    if ($nidn) $mapByNidn[$nidn] = $newKaryawan;
                    if ($nuptk) $mapByNuptk[$nuptk] = $newKaryawan;
                    if ($email) $mapByEmail[$email] = $newKaryawan;
                } else {
                    // Data sudah ada namun replaceExisting tidak diaktifkan
                    $skippedCount++;
                }
            }

            DB::commit();
            Log::info("[Karyawan] Impor berhasil: {$insertedCount} baru, {$updatedCount} diperbarui, {$skippedCount} dilewati.");

            $message = "Impor data SDM berhasil! {$insertedCount} data baru ditambahkan, {$updatedCount} data diperbarui.";
            if ($skippedCount > 0) {
                $message .= " {$skippedCount} data dilewati.";
            }

            if ($request->wantsJson() && !$request->header('X-Inertia')) {
                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'inserted' => $insertedCount,
                    'updated' => $updatedCount,
                    'skipped' => $skippedCount,
                    'errors' => $errorDetails,
                ]);
            }

            return $this->redirectToPaginatedList($request, 'karyawan', 'karyawan.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Karyawan] Gagal impor: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            if ($request->wantsJson() && !$request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memproses impor: ' . DatabaseErrorMessage::forUser($e, 'Periksa format berkas dan coba lagi.'),
                ], 500);
            }

            return back()->with('error', 'Gagal memproses berkas impor: ' . DatabaseErrorMessage::forUser($e, 'Periksa format berkas dan coba lagi.'));
        }
    }

    /** @param array<string, mixed>|object $row */
    private function normalizeRowKeys($row): array
    {
        if (!is_array($row) && !is_object($row)) {
            return [];
        }
        $row = (array) $row;

        $normalized = [
            'nik' => null,
            'nama' => null,
            'email' => null,
            'no_telepon' => null,
            'id_unit' => null,
            'unit' => null,
            'jabatan' => null,
            'status_pegawai' => null,
            'is_aktif' => null,
            'nidn' => null,
            'nuptk' => null,
        ];

        $gelarDepan = '';
        $namaLengkap = '';
        $jabatanStruktural = null;
        $jabatanLain = null;

        foreach ($row as $key => $val) {
            $cleanKey = preg_replace('/[^a-z0-9]/', '', strtolower((string)$key));
            if ($val === null || trim((string)$val) === '') continue;
            $strVal = trim((string)$val);

            // NIK: NIK TSU, NIK, No Induk, No KTP
            if ($cleanKey === 'niktsu' || $cleanKey === 'nik' || in_array($cleanKey, ['noinduk', 'noktp', 'nomorindukkaryawan'], true) || (str_contains($cleanKey, 'nik') && !str_contains($cleanKey, 'klinik'))) {
                $normalized['nik'] = $this->cleanImportIdentifier($strVal);
            }
            // Gelar Depan: (Gelar Depan), Gelar Depan
            elseif (str_contains($cleanKey, 'gelardepan') || $cleanKey === 'gelar') {
                $gelarDepan = $strVal;
            }
            // Nama Lengkap: NAMA LENGKAP, Nama, Fullname
            elseif (str_contains($cleanKey, 'namalengkap') || str_contains($cleanKey, 'nama') || in_array($cleanKey, ['name', 'fullname'], true)) {
                $namaLengkap = $strVal;
            }
            // Email: EMAIL TSU, Email, Surel
            elseif (str_contains($cleanKey, 'email') || str_contains($cleanKey, 'surel') || $cleanKey === 'mail') {
                $normalized['email'] = $this->cleanImportIdentifier($strVal);
            }
            // Jenis Pegawai: JENIS PEGAWAI, Status Kepegawaian
            elseif (str_contains($cleanKey, 'jenispegawai') || str_contains($cleanKey, 'statuspegawai') || str_contains($cleanKey, 'kepegawaian')) {
                $normalized['status_pegawai'] = $strVal;
            }
            // Nomor Telepon / WA: NOMOR WA, No Telp, HP, Phone (tidak boleh mencocokkan 'wa' pada 'pegawai' / 'karyawan')
            elseif ($cleanKey === 'wa' || $cleanKey === 'nomorwa' || $cleanKey === 'nowa' || str_contains($cleanKey, 'whatsapp') || str_contains($cleanKey, 'telepon') || str_contains($cleanKey, 'telp') || in_array($cleanKey, ['hp', 'nohp', 'phone'], true)) {
                $normalized['no_telepon'] = $strVal;
            }
            // Jabatan Struktural (Diprioritaskan sesuai instruksi: jabatan yg dipake adalah JABATAN STRUKTURAL)
            elseif (str_contains($cleanKey, 'struktural') || $cleanKey === 'jabatanstruktural') {
                $jabatanStruktural = $strVal;
            }
            // Abaikan Jabatan Fungsional
            elseif (str_contains($cleanKey, 'fungsional')) {
                continue;
            }
            // Jabatan umum (fallback jika kolom struktural tidak ada)
            elseif (str_contains($cleanKey, 'jabatan') || str_contains($cleanKey, 'posisi') || str_contains($cleanKey, 'role')) {
                $jabatanLain = $strVal;
            }
            // Status Keaktifan: STATUS, Status Aktif, Keaktifan
            elseif ($cleanKey === 'status' || str_contains($cleanKey, 'aktif') || str_contains($cleanKey, 'statusaktif') || str_contains($cleanKey, 'keaktifan') || $cleanKey === 'isaktif') {
                $lowerVal = strtolower($strVal);
                if (in_array($lowerVal, ['nonaktif', 'non aktif', 'tidak aktif', 'pensiun', 'keluar', 'tidak', '0', 'false'], true)) {
                    $normalized['is_aktif'] = false;
                } else {
                    $normalized['is_aktif'] = true;
                }
            }
            // NIDN
            elseif (str_contains($cleanKey, 'nidn')) {
                $normalized['nidn'] = $this->cleanImportIdentifier($strVal);
            }
            // NUPTK
            elseif (str_contains($cleanKey, 'nuptk')) {
                $normalized['nuptk'] = $this->cleanImportIdentifier($strVal);
            }
            // Unit: (Sesuai instruksi: untuk unitnya kosongan aja dulu)
            elseif (str_contains($cleanKey, 'unit') || str_contains($cleanKey, 'prodi') || str_contains($cleanKey, 'fakultas')) {
                $normalized['unit'] = null;
                $normalized['id_unit'] = null;
            }
        }

        // Tentukan Jabatan yang dipakai (Jabatan Struktural)
        $rawJabatan = $jabatanStruktural ?: $jabatanLain;
        if ($rawJabatan === '-' || $rawJabatan === '--' || $rawJabatan === '---') {
            $rawJabatan = null;
        }
        $normalized['jabatan'] = $rawJabatan;

        // Gabungkan Gelar Depan dengan Nama Lengkap jika ada
        if ($gelarDepan && $namaLengkap) {
            if (!str_starts_with(strtolower($namaLengkap), strtolower($gelarDepan))) {
                $normalized['nama'] = trim($gelarDepan . ' ' . $namaLengkap);
            } else {
                $normalized['nama'] = $namaLengkap;
            }
        } else {
            $normalized['nama'] = $namaLengkap ?: null;
        }

        return $normalized;
    }

    /** @param mixed $value */
    private function cleanImportIdentifier($value): ?string
    {
        if ($value === null) return null;

        $value = trim((string) $value);
        if ($value === '' || preg_match('/^[\-–—]+$/u', $value) || in_array(strtolower($value), ['n/a', 'na', 'null', 'undefined'], true)) {
            return null;
        }

        return $value;
    }

    private function parseCsvFile(string $path): array
    {
        $rows = [];
        if (($handle = fopen($path, 'r')) !== false) {
            $header = null;
            while (($data = fgetcsv($handle, 2000, ',')) !== false) {
                if (count($data) === 1 && str_contains($data[0], ';')) {
                    $data = str_getcsv($data[0], ';');
                }
                if (!$header) {
                    $data[0] = preg_replace('/^\xEF\xBB\xBF/', '', $data[0]);
                    $header = $data;
                    continue;
                }
                if (count($data) === count($header)) {
                    $rows[] = array_combine($header, $data);
                }
            }
            fclose($handle);
        }
        return $rows;
    }
}
