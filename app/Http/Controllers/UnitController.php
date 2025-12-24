<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log; // Added Log
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UnitController extends Controller
{
    public function index()
    {
        Log::debug('[Unit] Viewing Index');
        $units = Unit::with(['kepala'])->orderBy('nama_unit')->get();

        return Inertia::render('Admin/Unit/Index', [
            'units' => $units,
        ]);
    }

    public function create()
    {
        $users = User::orderBy('nama_lengkap')->get();
        $units = Unit::orderBy('nama_unit')->get();

        return Inertia::render('Admin/Unit/Create', [
            'users' => $users,
            'units' => $units,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('[Unit] Creating Unit', ['by_user' => Auth::id(), 'data' => $request->all()]);

        $validated = $request->validate([
            'kode_unit' => 'required|string|unique:unit,kode_unit',
            'nama_unit' => 'required|string',
            'tipe_unit' => ['required', Rule::in(['Fakultas', 'Prodi', 'Unit', 'Lainnya', 'Atasan', 'Admin'])],
            'jalur_persetujuan' => ['required', Rule::in(['akademik', 'non-akademik'])],
            'id_kepala' => 'nullable|exists:users,id_user',
            'parent_id' => 'nullable|exists:unit,id_unit',
            'no_telepon' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        Unit::create($validated);
        Log::info('[Unit] Unit created successfully: ' . $validated['nama_unit']);

        return Redirect::route('unit.index')->with('success', 'Unit berhasil ditambahkan.');
    }

    public function edit(Unit $unit)
    {
        return Inertia::render('Admin/Unit/Edit', [
            'unit' => $unit,
            'users' => User::all(),
            'units' => Unit::all(),
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        Log::info('[Unit] Updating Unit: ' . $unit->kode_unit, $request->all());

        $validated = $request->validate([
            'kode_unit' => ['required', 'string', Rule::unique('unit', 'kode_unit')->ignore($unit->id_unit, 'id_unit')],
            'nama_unit' => 'required|string',
            'tipe_unit' => ['required', Rule::in(['Fakultas', 'Prodi', 'Unit', 'Lainnya', 'Atasan', 'Admin'])],
            'jalur_persetujuan' => ['required', Rule::in(['akademik', 'non-akademik'])],
            'id_kepala' => 'nullable|exists:users,id_user',
            'parent_id' => 'nullable|exists:unit,id_unit',
            'no_telepon' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $unit->update($validated);

        return Redirect::route('unit.index')->with('success', 'Unit berhasil diperbarui.');
    }

    public function destroy(Unit $unit)
    {
        Log::warning('[Unit] Attempting delete: ' . $unit->nama_unit);
        try {
            $unit->delete();
            Log::info('[Unit] Deleted successfully.');
            return Redirect::route('unit.index')->with('success', 'Unit berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('[Unit] Delete Failed: ' . $e->getMessage());
            return Redirect::route('unit.index')->with('error', 'Gagal menghapus unit. Pastikan tidak ada relasi yang mengunci.');
        }
    }
}