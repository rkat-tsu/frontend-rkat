<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TahunAnggaranController extends Controller
{
    public function index(Request $request)
    {
        $query = TahunAnggaran::query();

        if ($request->search) {
            $query->where('tahun_anggaran', 'like', "%{$request->search}%");
        }

        // Urutkan berdasarkan tahun terbaru
        $perPage = request()->get('per_page', 10);
        $perPage = $perPage === 'all' ? 10000 : (int) $perPage;

        $tahunAnggarans = $query->select(['id_tahun', 'uuid', 'tahun_anggaran', 'tanggal_mulai', 'tanggal_akhir', 'status_rkat'])
            ->orderBy('tahun_anggaran', 'desc')
            ->paginate($perPage)->onEachSide(0)->withQueryString();

        return Inertia::render('Admin/TahunAnggaran/Index', [
            'tahunAnggarans' => $tahunAnggarans,
            'filters' => $request->only(['search']),
        ]);
    }


    public function store(Request $request)
    {
        Log::info('[TahunAnggaran] Membuat data baru.');

        $validated = $request->validate([
            'tahun_anggaran' => 'required|integer|unique:tahun_anggarans,tahun_anggaran',
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
            'indikator_labels' => 'nullable|array',
            'indikator_labels.past' => 'nullable|string|max:100',
            'indikator_labels.current' => 'nullable|string|max:100',
            'indikator_labels.future' => 'nullable|string|max:100',
        ]);

        TahunAnggaran::create($validated);

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil ditambahkan.');
    }


    public function update(Request $request, TahunAnggaran $tahun)
    {
        Log::info('[TahunAnggaran] Request Update UUID: '.$tahun->uuid);

        $validated = $request->validate([
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
            'indikator_labels' => 'nullable|array',
            'indikator_labels.past' => 'nullable|string|max:100',
            'indikator_labels.current' => 'nullable|string|max:100',
            'indikator_labels.future' => 'nullable|string|max:100',
        ]);

        $tahun->fill($validated)->save();

        Log::info('[TahunAnggaran] Berhasil update data.');

        return Redirect::route('tahun.index')->with('success', 'Tahun Anggaran berhasil diperbarui.');
    }

    public function destroy(TahunAnggaran $tahun)
    {
        TahunAnggaran::destroy($tahun->id_tahun);

        return Redirect::route('tahun.index')->with('success', 'Data berhasil dihapus.');
    }
}
