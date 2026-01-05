<?php

namespace App\Http\Controllers;

use App\Models\Ikk;
use App\Models\Iku;
use App\Models\IkuSub;
use App\Models\IndikatorKeberhasilan;
use App\Models\RincianAnggaran;
use App\Models\RkatDetail;
use App\Models\RkatHeader;
use App\Models\RkatRabItem;
use App\Models\TahunAnggaran;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RkatController extends Controller
{
    public function create()
    {
        Log::debug('[RKAT] Permintaan Halaman Buat oleh User: '.Auth::id());

        $tahunAnggarans = TahunAnggaran::all();
        $units = Unit::all();
        $akunAnggarans = RincianAnggaran::all();
        $ikus = Iku::with(['ikuSubs.ikks'])->get();
        $ikuSubs = IkuSub::with('iku', 'ikks')->get();
        $ikks = Ikk::all();

        Log::debug('[RKAT] Data Master Dimuat', [
            'tahun_count' => $tahunAnggarans->count(),
            'unit_count' => $units->count(),
            'akun_count' => $akunAnggarans->count(),
            'iku_count' => $ikus->count(),
        ]);

        return Inertia::render('Rkat/Create', [
            'tahunAnggarans' => $tahunAnggarans,
            'units' => $units,
            'akunAnggarans' => $akunAnggarans,
            'ikus' => $ikus,
            'ikuSubs' => $ikuSubs,
            'ikks' => $ikks,
        ]);
    }

    public function store(Request $request)
    {
        Log::debug('[RKAT] Payload Simpan Diterima', $request->all());

        // 1. VALIDASI DATA
        $request->validate([
            'iku_id' => ['required', 'integer', 'exists:ikus,id_iku'],
            'ikusub_id' => ['required', 'integer', 'exists:ikusubs,id_ikusub'],
            'ikk_id' => ['required', 'integer', 'exists:ikks,id_ikk'],
            'indikator_kinerja' => ['required', 'array', 'min:1'],
            'indikator_kinerja.*.indikator' => ['required', 'string'],
        ]);

        $request->validate([
            'rincian_anggaran' => ['required', 'array', 'min:1'],
            'rincian_anggaran.*.kode_anggaran' => ['required', 'string'],
            'rincian_anggaran.*.kebutuhan' => ['nullable', 'string', 'max:255'],
            'rincian_anggaran.*.vol' => ['required', 'numeric', 'min:1'],
            'rincian_anggaran.*.satuan' => ['required', 'string', 'max:50'],
            'rincian_anggaran.*.biaya_satuan' => ['required', 'numeric', 'min:0'],
            'rincian_anggaran.*.jumlah' => ['required', 'numeric', 'min:0'],
        ]);

        $validatedData = $request->validate([
            'tahun_anggaran' => ['required', 'exists:tahun_anggarans,tahun_anggaran'],
            'id_unit' => ['required', 'exists:unit,id_unit'],
            'kode_akun' => ['required', 'string'],
            'judul_pengajuan' => ['required', 'string'],
            'deskripsi_kegiatan' => ['required', 'string'],
            'latar_belakang' => ['required', 'string'],
            'rasional' => ['required', 'string'],
            'tujuan' => ['required', 'string'],
            'mekanisme' => ['required', 'string'],
            'jadwal_pelaksanaan_mulai' => ['required', 'date', 'after_or_equal:today'],
            'jadwal_pelaksanaan_akhir' => ['required', 'date', 'after_or_equal:jadwal_pelaksanaan_mulai'],
            'lokasi_pelaksanaan' => ['required', 'string'],
            'keberlanjutan' => ['required', 'string'],
            'pjawab' => ['required', 'string'],
            'target' => ['required', 'string'],
            'anggaran' => ['required', 'numeric', 'min:0'],
            'jenis_pencairan' => ['required', 'in:Bank,Tunai'],
            'nama_bank' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
            'nomor_rekening' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
            'atas_nama' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
        ]);

        try {
            DB::beginTransaction();

            // A. Simpan Indikator
            $savedIndicators = [];
            $primaryIndicatorId = null;

            foreach ($request->input('indikator_kinerja') as $index => $item) {
                $ik = IndikatorKeberhasilan::create([
                    'id_rkat_detail' => null,
                    'nama_indikator' => $item['indikator'],
                    'capai_2024' => $item['kondisi_akhir_2024_capaian'] ?? null,
                    'target_2025' => $item['tahun_2025_target'] ?? null,
                    'capai_2025' => $item['tahun_2025_capaian'] ?? null,
                    'target_2029' => $item['akhir_tahun_2029_target'] ?? null,
                    'capai_2029' => $item['akhir_tahun_2029_capaian'] ?? null,
                ]);
                
                $savedIndicators[] = $ik;
                
                // Ambil ID indikator pertama sebagai referensi foreign key di tabel rkat_details
                if ($index === 0) {
                    $primaryIndicatorId = $ik->id_indikator;
                }
            }

            // B. Simpan Header
            $rkatHeader = RkatHeader::create([
                'tahun_anggaran' => $validatedData['tahun_anggaran'],
                'id_unit' => $validatedData['id_unit'],
                'diajukan_oleh' => Auth::id(),
                'nomor_dokumen' => RkatHeader::generateNomorDokumen($validatedData['tahun_anggaran'], $validatedData['id_unit']),
                'status_persetujuan' => 'Draft',
                'tanggal_pengajuan' => now(),
            ]);

            // C. Simpan Detail
            $rkatDetail = RkatDetail::create([
                'id_header' => $rkatHeader->id_header,
                'kode_akun' => $validatedData['kode_akun'],
                'judul_kegiatan' => $validatedData['judul_pengajuan'],
                'deskripsi_kegiatan' => $request->input('deskripsi_kegiatan') ?? $validatedData['judul_pengajuan'],
                'id_iku' => $request->input('iku_id'),
                'id_ikusub' => $request->input('ikusub_id'),
                'id_ikk' => $request->input('ikk_id'),

                'id_indikator' => $primaryIndicatorId, 

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
                'jenis_kegiatan' => $request->input('jenis_kegiatan', 'Rutin'),
                'anggaran' => $validatedData['anggaran'],
                'jenis_pencairan' => $validatedData['jenis_pencairan'],
                'nama_bank' => $validatedData['nama_bank'] ?? null,
                'nomor_rekening' => $validatedData['nomor_rekening'] ?? null,
                'atas_nama' => $validatedData['atas_nama'] ?? null,
            ]);

            // D. Update relasi balik (Indikator -> Detail)
            foreach ($savedIndicators as $ik) {
                $ik->update(['id_rkat_detail' => $rkatDetail->id_rkat_detail]);
            }

            // E. Simpan RAB
            foreach ($request->input('rincian_anggaran') as $item) {
                RkatRabItem::create([
                    'id_rkat_detail' => $rkatDetail->id_rkat_detail,
                    'kode_anggaran' => $item['kode_anggaran'],
                    'deskripsi_item' => $item['kebutuhan'] ?? '-',
                    'volume' => $item['vol'],
                    'satuan' => $item['satuan'],
                    'harga_satuan' => $item['biaya_satuan'],
                    'sub_total' => $item['jumlah'],
                ]);
            }

            DB::commit();

            return redirect()->route('rkat.create')->with('success', 'Data berhasil disimpan');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[RKAT] Kesalahan: '.$e->getMessage());

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memproses data RKAT: '.$e->getMessage())->withInput();
        }
    }

    public function show($id)
    {
        // Load RKAT beserta semua relasinya
        $rkat = RkatHeader::with([
            'unit',
            'user',
            'detail.iku',
            'detail.ikuSub',
            'detail.ikk',
            'detail.rabItems',
            'detail.indikators',
        ])->findOrFail($id);

        return Inertia::render('Rkat/Show', [
            'rkat' => $rkat,
        ]);
    }
}