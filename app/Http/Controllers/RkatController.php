<?php

namespace App\Http\Controllers;


use App\Models\Iku;
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
        Log::debug('[RKAT] Permintaan Halaman Buat oleh User: ' . Auth::id());

        $tahunAnggarans = TahunAnggaran::where('status_rkat', '!=', 'Closed')->get();

        // JIKA TIDAK ADA TAHUN YANG DIBUKA:
        if ($tahunAnggarans->isEmpty()) {
            return redirect()->route('rkat.index')->with('error', 'Maaf, periode penginputan RKAT saat ini sedang ditutup atau belum dibuka.');
        }

        $units = Unit::orderBy('kode_unit')->get();
        $akunAnggarans = RincianAnggaran::orderBy('kode_anggaran')->get();

        $ikus = Iku::with(['ikks'])->get();

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
        ]);
    }

    public function index(Request $request)
    {
        $query = RkatHeader::with(['unit']);

        // Jika pengguna bukan admin, batasi ke unit sendiri
        if (Auth::user()->peran !== 'Admin') {
            $query->where('id_unit', Auth::user()->id_unit);
        }

        // PENCARIAN & FILTER
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_dokumen', 'like', "%{$search}%")
                    ->orWhereHas('unit', function ($q) use ($search) {
                        $q->where('nama_unit', 'like', "%{$search}%");
                    });
            });
        }
        if ($request->filled('tahun')) {
            $query->where('tahun_anggaran', $request->tahun);
        }
        if ($request->filled('status')) {
            $query->where('status_persetujuan', $request->status);
        }

        $rkats = $query->orderBy('tanggal_pengajuan', 'desc')->paginate(15)->withQueryString();

        $tahunAnggarans = TahunAnggaran::orderBy('tahun_anggaran', 'desc')->pluck('tahun_anggaran');

        return Inertia::render('Rkat/Index', [
            'rkats' => $rkats,
            'filters' => $request->only(['search', 'tahun', 'status']),
            'tahunAnggarans' => $tahunAnggarans,
        ]);
    }

    public function store(Request $request)
    {
        Log::debug('[RKAT] Payload Simpan Diterima', $request->all());

        // Cek kembali status tahun anggaran di backend
        $tahun = TahunAnggaran::where('tahun_anggaran', $request->tahun_anggaran)->first();
        if (!$tahun || $tahun->status_rkat === 'Closed') {
            return redirect()->back()->with('error', 'Gagal menyimpan! Periode tahun anggaran ini sudah ditutup.');
        }

        // 1. VALIDASI KINERJA
        $request->validate([
            'iku_id' => ['required', 'integer', 'exists:ikus,id_iku'],
            'ikk_id' => ['required', 'integer', 'exists:ikks,id_ikk'],
            'indikator_kinerja' => ['required', 'array', 'min:1'],
            'indikator_kinerja.*.indikator' => ['required', 'string'],
        ]);

        // 2. VALIDASI RAB
        $request->validate([
            'rincian_anggaran' => ['required', 'array', 'min:1'],
            'rincian_anggaran.*.kode_anggaran' => ['required', 'string'],
            'rincian_anggaran.*.kebutuhan' => ['nullable', 'string', 'max:255'],
            'rincian_anggaran.*.vol' => ['required', 'numeric', 'min:1'],
            'rincian_anggaran.*.satuan' => ['required', 'string', 'max:50'],
            'rincian_anggaran.*.biaya_satuan' => ['required', 'numeric', 'min:0'],
            'rincian_anggaran.*.jumlah' => ['required', 'numeric', 'min:0'],
        ]);

        // 3. VALIDASI HEADER & DETAIL
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
            'jenis_kegiatan' => ['required', 'string'],
            'pjawab' => ['required', 'string'],
            'target' => ['required', 'string'],
            'anggaran' => ['required', 'numeric', 'min:0'],
            'jenis_pencairan' => ['required', 'in:Bank,Tunai'],
            'nama_bank' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
            'nomor_rekening' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
            'atas_nama' => ['nullable', 'required_if:jenis_pencairan,Bank', 'string'],
            'dokumen_pendukung' => ['nullable', 'array'],
            'dokumen_pendukung.*' => ['in:Pengajuan Rutin,Proposal,TOR,Usulan'],
        ]);

        try {
            DB::beginTransaction();

            // A. SIMPAN HEADER RKAT
            $rkatHeader = RkatHeader::create([
                'tahun_anggaran' => $validatedData['tahun_anggaran'],
                'id_unit' => $validatedData['id_unit'],
                'diajukan_oleh' => Auth::id(),
                'nomor_dokumen' => RkatHeader::generateNomorDokumen($validatedData['tahun_anggaran'], $validatedData['id_unit']),
                'status_persetujuan' => 'Draft',
                'tanggal_pengajuan' => now(),
                'total_anggaran' => $validatedData['anggaran'],
            ]);

            // B. SIMPAN DETAIL RKAT
            $rkatDetail = RkatDetail::create([
                'id_header' => $rkatHeader->id_header,
                'judul_kegiatan' => $validatedData['judul_pengajuan'],
                'deskripsi_kegiatan' => $request->input('deskripsi_kegiatan') ?? $validatedData['judul_pengajuan'],
                'id_iku' => $request->input('iku_id'),
                'id_ikk' => $request->input('ikk_id'),

                // Form Isian Lengkap
                'latar_belakang' => $validatedData['latar_belakang'],
                'rasional' => $validatedData['rasional'],
                'tujuan' => $validatedData['tujuan'],
                'mekanisme' => $validatedData['mekanisme'],
                'jadwal_pelaksanaan_mulai' => $validatedData['jadwal_pelaksanaan_mulai'],
                'jadwal_pelaksanaan_akhir' => $validatedData['jadwal_pelaksanaan_akhir'],
                'lokasi_pelaksanaan' => $validatedData['lokasi_pelaksanaan'],
                'jenis_kegiatan' => $validatedData['jenis_kegiatan'],
                'pjawab' => $validatedData['pjawab'],
                'target' => $validatedData['target'],
                'anggaran' => $validatedData['anggaran'],

                // Pencairan
                'jenis_pencairan' => $validatedData['jenis_pencairan'],
                'nama_bank' => $validatedData['nama_bank'] ?? null,
                'nomor_rekening' => $validatedData['nomor_rekening'] ?? null,
                'atas_nama' => $validatedData['atas_nama'] ?? null,
                'dokumen_pendukung' => $validatedData['dokumen_pendukung'] ?? null,
            ]);

            // C. SIMPAN INDIKATOR KEBERHASILAN (Multi-row)
            foreach ($request->input('indikator_kinerja') as $item) {
                IndikatorKeberhasilan::create([
                    'id_rkat_detail' => $rkatDetail->id_rkat_detail,
                    'nama_indikator' => $item['indikator'],

                    // Mapping field Form -> Database
                    'capai_2024'  => $item['kondisi_akhir_2024_capaian'] ?? null,
                    'target_2025' => $item['tahun_2025_target'] ?? null,
                    'capai_2025'  => $item['tahun_2025_capaian'] ?? null,
                    'target_2029' => $item['akhir_tahun_2029_target'] ?? null,
                    'capai_2029'  => $item['akhir_tahun_2029_capaian'] ?? null,
                ]);
            }

            // D. SIMPAN RAB
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

            return redirect()->route('rkat.index')->with('success', 'Pengajuan RKAT berhasil disimpan sebagai Draft.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[RKAT] Kesalahan: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memproses data: ' . $e->getMessage())->withInput();
        }
    }

    public function show(RkatHeader $rkatHeader)
    {
        $rkatHeader->load([
            'unit',
            'user',
            'rkatDetails.iku',
            'rkatDetails.ikk',
            'rkatDetails.rabItems',
            'rkatDetails.indikators',
        ]);

        return Inertia::render('Rkat/Show', [
            'rkat' => $rkatHeader,
        ]);
    }

    /**
     * MENGIRIM / MENGAJUKAN RKAT DARI DRAFT KE APPROVAL
     */
    public function submit(RkatHeader $rkatHeader)
    {
        // Pastikan hanya Draft atau Revisi yang bisa diajukan
        if (!in_array($rkatHeader->status_persetujuan, ['Draft', 'Revisi'])) {
            return redirect()->back()->with('error', 'Hanya dokumen Draft atau Revisi yang dapat diajukan.');
        }

        return redirect()->back()->with('success', 'RKAT berhasil diajukan dan sedang menunggu persetujuan Dekan/Kepala Unit.');
    }
}
