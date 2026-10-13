<?php

namespace App\Http\Controllers;

use App\Models\JenisKegiatanOption;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class JenisKegiatanOptionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/JenisKegiatan/Index', [
            'options' => JenisKegiatanOption::query()->orderBy('grup')->orderBy('nama')->get(),
            'groups' => JenisKegiatanOption::query()->select(['grup', 'kode_grup'])->distinct()->orderBy('grup')->orderBy('kode_grup')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'grup' => ['required', 'string', 'max:100'],
            'kode_grup' => ['required', 'string', 'max:100', Rule::exists('jenis_kegiatan_options', 'kode_grup')->where('grup', $request->input('grup'))],
            'nama' => ['required', 'string', 'max:100', Rule::unique('jenis_kegiatan_options', 'nama')->where('kode_grup', $request->input('kode_grup'))],
        ]);

        if ($validated['kode_grup'] === 'status_pegawai' && mb_strlen($validated['nama']) > 50) {
            return back()->withErrors(['nama' => 'Nama status kepegawaian maksimal 50 karakter.']);
        }

        JenisKegiatanOption::create($validated + ['is_active' => true]);

        return back()->with('success', 'Opsi jenis kegiatan berhasil ditambahkan.');
    }

    public function update(Request $request, JenisKegiatanOption $option)
    {
        $validated = $request->validate([
            'grup' => ['required', 'string', 'max:100'],
            'kode_grup' => ['required', 'string', 'max:100', Rule::exists('jenis_kegiatan_options', 'kode_grup')->where('grup', $request->input('grup'))],
            'nama' => ['required', 'string', 'max:100', Rule::unique('jenis_kegiatan_options', 'nama')->where('kode_grup', $request->input('kode_grup'))->ignore($option->id)],
            'is_active' => ['required', 'boolean'],
        ]);

        if ($validated['kode_grup'] === 'status_pegawai' && mb_strlen($validated['nama']) > 50) {
            return back()->withErrors(['nama' => 'Nama status kepegawaian maksimal 50 karakter.']);
        }

        $referencedTable = match ($option->kode_grup) {
            'jenis_kegiatan' => 'rkat_details',
            'tipe_unit' => 'unit',
            'status_pegawai' => 'karyawans',
            default => null,
        };
        $referencedColumn = match ($option->kode_grup) {
            'jenis_kegiatan' => 'jenis_kegiatan',
            'tipe_unit' => 'tipe_unit',
            'status_pegawai' => 'status_pegawai',
            default => null,
        };
        $isUsed = $referencedTable && DB::table($referencedTable)->where($referencedColumn, $option->nama)->exists();

        if ($isUsed && $validated['kode_grup'] !== $option->kode_grup) {
            return back()->withErrors(['kode_grup' => 'Grup opsi yang sudah digunakan tidak dapat dipindahkan.']);
        }

        DB::transaction(function () use ($option, $validated, $isUsed, $referencedTable, $referencedColumn) {
            if ($isUsed && $option->nama !== $validated['nama']) {
                DB::table($referencedTable)->where($referencedColumn, $option->nama)->update([$referencedColumn => $validated['nama']]);
            }
            $option->update($validated);
        });

        return back()->with('success', 'Opsi jenis kegiatan berhasil diperbarui.');
    }

    public function destroy(JenisKegiatanOption $option)
    {
        $isUsed = match ($option->kode_grup) {
            'tipe_unit' => Unit::where('tipe_unit', $option->nama)->exists(),
            'jenis_kegiatan' => DB::table('rkat_details')->where('jenis_kegiatan', $option->nama)->exists(),
            'status_pegawai' => DB::table('karyawans')->where('status_pegawai', $option->nama)->exists(),
            default => false,
        };

        if ($isUsed || in_array($option->nama, ['Rutin', 'Inovasi'], true)) {
            return back()->withErrors([
                'option' => 'Opsi bawaan atau yang sudah digunakan tidak dapat dihapus. Nonaktifkan jika tidak ingin digunakan.',
            ]);
        }

        $option->delete();

        return back()->with('success', 'Opsi jenis kegiatan berhasil dihapus.');
    }
}
