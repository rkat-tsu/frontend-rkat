<?php

namespace App\Http\Controllers;

use App\Models\JenisKegiatanOption;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class JenisKegiatanOptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/JenisKegiatan/Index', [
            'options' => JenisKegiatanOption::query()->orderBy('nama')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100', 'unique:jenis_kegiatan_options,nama'],
        ]);

        JenisKegiatanOption::create($validated + ['is_active' => true]);

        return back()->with('success', 'Opsi jenis kegiatan berhasil ditambahkan.');
    }

    public function update(Request $request, JenisKegiatanOption $option)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100', Rule::unique('jenis_kegiatan_options', 'nama')->ignore($option->id)],
            'is_active' => ['required', 'boolean'],
        ]);

        $option->update($validated);

        return back()->with('success', 'Opsi jenis kegiatan berhasil diperbarui.');
    }

    public function destroy(JenisKegiatanOption $option)
    {
        if (in_array($option->nama, ['Rutin', 'Inovasi'], true)) {
            return back()->with('error', 'Opsi bawaan tidak dapat dihapus. Nonaktifkan jika tidak ingin digunakan.');
        }

        $option->delete();

        return back()->with('success', 'Opsi jenis kegiatan berhasil dihapus.');
    }
}
