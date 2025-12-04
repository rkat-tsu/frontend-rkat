<?php

namespace App\Http\Controllers;

use App\Models\Ikk;
use App\Models\Iku;
use App\Models\IkuSub;
use App\Models\IndikatorKeberhasilan;
use App\Models\ProgramKerja;
use App\Models\RincianAnggaran;
use App\Models\RkatDetail;
use App\Models\RkatHeader;
use App\Models\RkatRabItem;
use App\Models\TahunAnggaran;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia; // Jika menggunakan Inertia

class RkatController extends Controller
{
    /**
     * Tampilkan halaman formulir pengajuan RKAT.
     */
    public function create()
    {
        // Data master yang diperlukan untuk frontend
        $tahunAnggarans = TahunAnggaran::all();
        $units = Unit::all();
        $programKerjas = ProgramKerja::all();
        $akunAnggarans = RincianAnggaran::all();
        $ikus = Iku::with(['ikuSubs.ikks'])->get();
        $ikuSubs = IkuSub::with('iku', 'ikks')->get();
        $ikks = Ikk::all();

        return Inertia::render('Rkat/Create', [
            'tahunAnggarans' => $tahunAnggarans,
            'units' => $units,
            'programKerjas' => $programKerjas,
            'akunAnggarans' => $akunAnggarans,
            'ikus' => $ikus,
            'ikuSubs' => $ikuSubs,
            'ikks' => $ikks,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'indikator_kinerja' => ['required', 'array', 'min:1'],
            'indikator_kinerja.*.indikator' => ['required', 'string'],
            'indikator_kinerja.*.kondisi_akhir_2024_capaian' => ['nullable', 'string'],
            'indikator_kinerja.*.tahun_2025_target' => ['nullable', 'string'],
            'indikator_kinerja.*.tahun_2025_capaian' => ['nullable', 'string'],
            'indikator_kinerja.*.akhir_tahun_2029_target' => ['nullable', 'string'],
            'indikator_kinerja.*.akhir_tahun_2029_capaian' => ['nullable', 'string'],
        ]);

        // Validasi Item RAB (Rincian Anggaran Per Item Biaya)
        $request->validate([
            'rincian_anggaran' => ['required', 'array', 'min:1'],
            'rincian_anggaran.*.kode_anggaran' => ['required', 'string', 'exists:rincian_anggarans,kode_anggaran'],
            'rincian_anggaran.*.kebutuhan' => ['required', 'string', 'max:255'],
            'rincian_anggaran.*.vol' => ['required', 'numeric', 'min:1'],
            'rincian_anggaran.*.satuan' => ['required', 'string', 'max:50'],
            'rincian_anggaran.*.biaya_satuan' => ['required', 'numeric', 'min:0'],
            'rincian_anggaran.*.jumlah' => ['required', 'numeric', 'min:0'], // sub_total
        ]);

        // Validasi Header dan Detail Kegiatan (digabung dalam formulir)
        $validatedData = $request->validate([
            // Header Fields
            'tahun_anggaran' => ['required', 'exists:tahun_anggarans,tahun_anggaran'],
            'id_unit' => ['required', 'exists:unit,id_unit'],
            // Detail Fields
            'id_program' => ['required', 'exists:program_kerjas,id_proker'],
            'kode_akun' => ['required', 'exists:rincian_anggarans,kode_anggaran'], // Kode Akun Utama Kegiatan
            'judul_pengajuan' => ['required', 'string'],
            'deskripsi_kegiatan' => $validatedData['judul_pengajuan'], // Dipakai untuk deskripsi_kegiatan
            'latar_belakang' => ['required', 'string'],
            'rasional' => ['required', 'string'],
            'tujuan' => ['required', 'string'],
            'mekanisme' => ['required', 'string'],
            'jadwal_pelaksanaan_mulai' => ['required', 'date', 'after_or_equal:now'],
            'jadwal_pelaksanaan_akhir' => ['required', 'date', 'after_or_equal:jadwal_pelaksanaan_mulai'],
            'lokasi_pelaksanaan' => ['required', 'string'],
            'keberlanjutan' => ['required', 'string'],
            'pjawab' => ['required', 'string'],
            'target' => ['required', 'string'],
            'anggaran' => ['required', 'numeric', 'min:0'], // Total Anggaran Kegiatan
            // Pencairan
            'jenis_pencairan' => ['required', 'in:Bank,Tunai'],
            'nama_bank' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
            'nomor_rekening' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
            'atas_nama' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
        ]);

        // ====================================================================
        // 2. Transaksi Database
        // ====================================================================

        try {
            DB::beginTransaction();

            // --- A. Simpan Indikator Kinerja Keberhasilan ---
            $indikatorKeberhasilan = collect($request->input('indikator_kinerja'))->map(function ($item) {
                return [
                    'nama_indikator' => $item['indikator'],
                    'capai_2024' => $item['kondisi_akhir_2024_capaian'] ?? null,
                    'target_2025' => $item['tahun_2025_target'] ?? null,
                    'capai_2025' => $item['tahun_2025_capaian'] ?? null,
                    'target_2029' => $item['akhir_tahun_2029_target'] ?? null,
                    'capai_2029' => $item['akhir_tahun_2029_capaian'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });

            IndikatorKeberhasilan::insert($indikatorKeberhasilan->toArray());

            // Dapatkan ID dari indikator pertama yang baru disimpan untuk FK di RkatDetail
            $lastId = DB::getPdo()->lastInsertId();
            $firstIndikatorId = $lastId - $indikatorKeberhasilan->count() + 1;

            // --- B. Simpan RKAT Header ---
            $rkatHeader = RkatHeader::create([
                'tahun_anggaran' => $validatedData['tahun_anggaran'],
                'id_unit' => $validatedData['id_unit'],
                'diajukan_oleh' => Auth::id(), // ID user yang sedang login
                'nomor_dokumen' => RkatHeader::generateNomorDokumen($validatedData['tahun_anggaran'], $validatedData['id_unit']), // Asumsi ada helper method
                'status_persetujuan' => 'Draft',
                'tanggal_pengajuan' => now(),
            ]);

            // --- C. Simpan RKAT Detail (Item Kegiatan Utama) ---
            $rkatDetail = RkatDetail::create([
                'id_header' => $rkatHeader->id_header,
                'kode_akun' => $validatedData['kode_akun'],
                'id_program' => $validatedData['id_program'],
                'id_indikator' => $firstIndikatorId, // FK ke Indikator yang baru disimpan

                // Deskripsi Kegiatan
                'deskripsi_kegiatan' => $validatedData['judul_pengajuan'],
                'latar_belakang' => $validatedData['latar_belakang'],
                'rasional' => $validatedData['rasional'],
                'tujuan' => $validatedData['tujuan'],
                'mekanisme' => $validatedData['mekanisme'],
                'jadwal_pelaksanaan_mulai' => $validatedData['jadwal_pelaksanaan_mulai'],
                'jadwal_pelaksanaan_akhir' => $validatedData['jadwal_pelaksanaan_akhir'],
                'lokasi_pelaksanaan' => $validatedData['lokasi_pelaksanaan'],
                'keberlanjutan' => $validatedData['keberlanjutan'],
                'pjawab' => $validatedData['pjawab'],
                'target' => $validatedData['target'],

                'jenis_kegiatan' => $request->input('jenis_kegiatan', 'Rutin'), // Asumsi input atau default
                'dokumen_pendukung' => null,

                // Anggaran dan Pencairan
                'anggaran' => $validatedData['anggaran'],
                'jenis_pencairan' => $validatedData['jenis_pencairan'],
                'nama_bank' => $validatedData['nama_bank'] ?? null,
                'nomor_rekening' => $validatedData['nomor_rekening'] ?? null,
                'atas_nama' => $validatedData['atas_nama'] ?? null,
            ]);

            // --- D. Simpan Rincian Anggaran (RAB Items) ---
            $rabItems = [];
            foreach ($request->input('rincian_anggaran') as $item) {
                $rabItems[] = [
                    'id_rkat_detail' => $rkatDetail->id_rkat_detail,
                    'kode_anggaran' => $item['kode_anggaran'],
                    'deskripsi_item' => $item['kebutuhan'],
                    'volume' => $item['vol'],
                    'satuan' => $item['satuan'],
                    'harga_satuan' => $item['biaya_satuan'],
                    'sub_total' => $item['jumlah'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            RkatRabItem::insert($rabItems);

            DB::commit();

            return redirect()->route('rkat.store', $rkatHeader->id_header)->with('success', 'Pengajuan RKAT berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Gagal menyimpan RKAT: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data. Error: '.$e->getMessage())->withInput();
        }
    }

    // Asumsi method statis ini ada di Model RkatHeader
    /*
    protected static function generateNomorDokumen($tahun, $unitId)
    {
        // Contoh implementasi dummy
        return 'RKAT/' . $unitId . '/' . $tahun . '/' . DB::table('rkat_headers')->where('tahun_anggaran', $tahun)->count() + 1;
    }
    */
}
