<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Diperlukan untuk transaksi

// Import Model-Model yang Dibutuhkan
use App\Models\TahunAnggaran;
use App\Models\Departemen;
use App\Models\ProgramKerja;
use App\Models\AkunAnggaran;
use App\Models\RkatHeader; // Model RKAT Header
use App\Models\RkatDetail; // Model RKAT Detail

class RkatController extends Controller
{
    /**
     * Menampilkan halaman formulir input RKAT.
     * Melakukan eager loading untuk data dropdown.
     */
    public function create()
    {
        // Ambil tahun anggaran yang statusnya masih 'Drafting' (bisa diisi)
        $tahunAnggarans = TahunAnggaran::where('status_rkat', 'Drafting')->get(['tahun_anggaran']);
        
        // Ambil data Departemen untuk Unit Kerja/Sub Unit
        $departemens = Departemen::all(['id_departemen', 'nama_departemen']);
        
        // Ambil Program Kerja, eager load sampai ke IKU untuk kebutuhan display di form
        $programKerjas = ProgramKerja::with(['ikk.ikusub.iku'])->get();
        
        // Ambil Kode Akun Anggaran
        $akunAnggarans = AkunAnggaran::all(['kode_akun', 'nama_akun']);

        return Inertia::render('Rkat/Create', [
            'tahunAnggarans' => $tahunAnggarans,
            'departemens' => $departemens,
            'programKerjas' => $programKerjas,
            'akunAnggarans' => $akunAnggarans,
        ]);
    }

    /**
     * Menyimpan data RKAT dari formulir 1-item (Header dan Detail).
     */
    public function store(Request $request)
    {
        // 1. Validasi Data
        $validated = $request->validate([
            // --- HEADER FIELDS (RkatHeader) ---
            'tahun_anggaran' => 'required|integer|exists:tahun_anggarans,tahun_anggaran',
            'id_departemen' => 'required|exists:departemens,id_departemen',
            'nomor_dokumen' => 'nullable|string|max:50', // Kode Kegiatan
            'judul_pengajuan' => 'required|string|max:255', // Judul Kegiatan

            // --- DETAIL FIELDS (RkatDetail) ---
            'id_program' => 'required|exists:program_kerjas,id_proker', // Program Kerja (Proker)
            'kode_akun' => 'required|exists:akun_anggarans,kode_akun', // Akun Anggaran
            
            // Kolom Teks Panjang
            'latar_belakang' => 'required|string',
            'rasional' => 'required|string',
            'tujuan' => 'required|string',
            'mekanisme' => 'required|string',
            'indikator_keberhasilan' => 'required|string', // Indikator Kerja
            
            // Kolom Waktu dan Anggaran
            'waktu_pelaksanaan' => 'nullable|date', // Jadwal Pelaksanaan
            'anggaran' => 'required|numeric|min:0', // Anggaran (RAB)
            
            // Kolom Lain yang mungkin dikirim dari form (jika ada inputnya di form)
            'kegiatan' => 'nullable|in:Rutin,Inovasi',
            'lokasi_pelaksanaan' => 'nullable|string|max:255', // CATATAN: Field ini TIDAK ADA di skema rkat_details. Jika penting, migrasi harus diupdate.
            // Anda dapat menambahkan validasi untuk field rkat_details lainnya seperti target, jenis_pencairan, bank, dll. jika diimplementasikan di form.
        ]);
        
        // Menggunakan Transaction untuk memastikan kedua data (Header dan Detail) tersimpan
        try {
            DB::beginTransaction();

            // 2. Simpan RKAT Header (Membuat dokumen utama)
            $header = RkatHeader::create([
                'tahun_anggaran' => $validated['tahun_anggaran'],
                'id_departemen' => $validated['id_departemen'],
                'diajukan_oleh' => Auth::id(), // Mengambil ID user yang sedang login
                'nomor_dokumen' => $validated['nomor_dokumen'] ?? null,
                'judul_pengajuan' => $validated['judul_pengajuan'],
                'status_persetujuan' => 'Draft', // Default status awal
                'tanggal_pengajuan' => now(),
            ]);
            
            // 3. Simpan RKAT Detail (Membuat rincian kegiatan)
            RkatDetail::create([
                'id_header' => $header->id_header,
                'kode_akun' => $validated['kode_akun'],
                'id_program' => $validated['id_program'],
                
                // Menggunakan judul_pengajuan dari header sebagai deskripsi_kegiatan
                'deskripsi_kegiatan' => $validated['judul_pengajuan'], 
                
                // Rincian Program
                'latar_belakang' => $validated['latar_belakang'],
                'rasional' => $validated['rasional'],
                'tujuan' => $validated['tujuan'],
                'mekanisme' => $validated['mekanisme'],
                'indikator_keberhasilan' => $validated['indikator_keberhasilan'],
                
                // Anggaran dan Waktu
                'waktu_pelaksanaan' => $validated['waktu_pelaksanaan'],
                'anggaran' => $validated['anggaran'],
                'kegiatan' => $validated['kegiatan'] ?? 'Rutin', // Menggunakan default jika tidak disetel
                
                // Menetapkan nilai default untuk field yang tidak ada di form (wajib diisi jika tidak nullable)
                'jenis_pencairan' => 'Tunai', 
            ]);

            DB::commit();
            
            return redirect()->route('dashboard')->with('success', 'RKAT dengan judul "' . $header->judul_pengajuan . '" berhasil dibuat dan disimpan sebagai Draft.');

        } catch (\Exception $e) {
            DB::rollBack();
            // Log the error or return a specific error message
            // return back()->withErrors(['gagal' => 'Gagal menyimpan RKAT. Error: ' . $e->getMessage()]);
            return back()->with('error', 'Gagal menyimpan RKAT karena kesalahan database.');
        }
    }

    // CATATAN: Anda perlu membuat route('dashboard') atau route('rkat.index') 
    // agar redirect di atas berfungsi dengan baik.
}