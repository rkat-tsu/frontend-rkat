<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class TahunAnggaranController extends Controller
{
    /**
     * Menampilkan daftar semua tahun anggaran (Index).
     * Akan dikirimkan sebagai props ke komponen React/Inertia.
     */
    public function index()
    {
        // Ambil data tahun anggaran, diurutkan dari yang terbaru, dengan pagination.
        $tahunAnggarans = TahunAnggaran::orderBy('tahun_anggaran', 'desc')->paginate(10);

        // Mengirim data ke Inertia (komponen React Admin/TahunAnggaran/Index)
        return Inertia::render('Admin/TahunAnggaran/Index', [
            'tahunAnggarans' => $tahunAnggarans,
        ]);
    }

    /**
     * Menampilkan form untuk membuat tahun anggaran baru (Create).
     */
    public function create()
    {
        return Inertia::render('Admin/TahunAnggaran/Create');
    }

    /**
     * Menyimpan tahun anggaran baru ke database (Store).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Validasi tahun anggaran harus unik, integer, dan minimal tahun berjalan - 1
            'tahun_anggaran' => 'required|integer|unique:tahun_anggarans,tahun_anggaran|min:' . (date('Y') - 1),
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after:tanggal_mulai',
            // Validasi ENUM status_rkat
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
        ]);

        TahunAnggaran::create($validated);

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil ditambahkan.');
    }

    /**
     * Menampilkan form untuk mengedit tahun anggaran (Edit).
     * Menggunakan Route Model Binding ($tahun).
     */
    public function edit(TahunAnggaran $tahun)
    {
        return Inertia::render('Admin/TahunAnggaran/Edit', [
            'tahun' => $tahun,
        ]);
    }

    /**
     * Memperbarui tahun anggaran di database (Update).
     * Menggunakan Route Model Binding ($tahun).
     */
    public function update(Request $request, TahunAnggaran $tahun)
    {
        $validated = $request->validate([
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
        ]);

        $tahun->update($validated);

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil diperbarui.');
    }

    /**
     * Menghapus tahun anggaran dari database (Destroy).
     * Menggunakan Route Model Binding ($tahun).
     */
    public function destroy(TahunAnggaran $tahun)
    {
        // PERHATIAN: Hapus tahun anggaran akan menghapus semua RKAT Header terkait (karena onDelete('cascade'))
        try {
            $tahun->delete();
            return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil dihapus.');
        } catch (\Exception $e) {
            // Tangani error jika ada relasi yang menghalangi
            return Redirect::route('tahun.index')->with('error', 'Gagal menghapus tahun anggaran. Pastikan tidak ada data RKAT yang menggunakannya.');
        }
    }
}