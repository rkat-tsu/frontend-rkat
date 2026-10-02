<?php

namespace App\Http\Controllers;

use App\Models\Karyawan;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class KaryawanController extends Controller
{
    public function index(Request $request)
    {
        Log::debug('[Karyawan] Halaman Index SDM.');

        $query = Karyawan::query()->with(['unit:id_unit,kode_unit,nama_unit']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('jabatan', 'like', "%{$search}%")
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

        if (in_array($sortBy, ['nik', 'nama', 'email', 'jabatan', 'status_pegawai', 'is_aktif'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('nama', 'asc');
        }

        $karyawans = $query->paginate($perPage)->onEachSide(0)->withQueryString();

        $units = Unit::query()->select(['id_unit', 'kode_unit', 'nama_unit'])->orderBy('nama_unit', 'asc')->get();

        return Inertia::render('Admin/Karyawan/Index', [
            'karyawans' => $karyawans,
            'units' => $units,
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
            'status_pegawai' => 'required|string|max:50',
            'is_aktif' => 'boolean',
        ]);

        Karyawan::create($validated);
        Log::info('[Karyawan] Dibuat: ' . $validated['nama']);

        return Redirect::route('karyawan.index')->with('success', 'Data SDM / Karyawan berhasil ditambahkan.');
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
            'status_pegawai' => 'required|string|max:50',
            'is_aktif' => 'boolean',
        ]);

        $karyawan->update($validated);
        Log::info('[Karyawan] Diperbarui: ' . $karyawan->nama);

        return Redirect::route('karyawan.index')->with('success', 'Data SDM / Karyawan berhasil diperbarui.');
    }

    public function destroy(Karyawan $karyawan)
    {
        Log::warning('[Karyawan] Menghapus: ' . $karyawan->nama);
        try {
            $karyawan->delete();
            return Redirect::route('karyawan.index')->with('success', 'Data SDM / Karyawan berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('[Karyawan] Kesalahan Hapus: ' . $e->getMessage());
            return Redirect::route('karyawan.index')->with('error', 'Gagal menghapus data SDM.');
        }
    }
}
