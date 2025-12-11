<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

class UnitController extends Controller
{
    /**
     * Display a listing of units.
     */
    public function index()
    {
        $units = Unit::with(['kepala'])->orderBy('nama_unit')->get();

        return Inertia::render('Admin/Unit/Index', [
            'units' => $units,
        ]);
    }

    /**
     * Show the form for creating a new unit.
     */
    public function create()
    {
        $users = User::orderBy('nama_lengkap')->get();
        $units = Unit::orderBy('nama_unit')->get();

        return Inertia::render('Admin/Unit/Create', [
            'users' => $users,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created unit in storage.
     */
    public function store(Request $request)
    {
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

        return Redirect::route('unit.index')->with('success', 'Unit berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified unit.
     */
    public function edit(Unit $unit)
    {
        $users = User::orderBy('nama_lengkap')->get();

        return Inertia::render('Admin/Unit/Edit', [
            'unit' => $unit,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified unit in storage.
     */
    public function update(Request $request, Unit $unit)
    {
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

    /**
     * Remove the specified unit from storage.
     */
    public function destroy(Unit $unit)
    {
        try {
            $unit->delete();
            return Redirect::route('unit.index')->with('success', 'Unit berhasil dihapus.');
        } catch (\Exception $e) {
            return Redirect::route('unit.index')->with('error', 'Gagal menghapus unit. Pastikan tidak ada relasi yang mengunci.');
        }
    }
}
