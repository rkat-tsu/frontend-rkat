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

        $sortBy = $request->input('sort_by', 'tahun_anggaran');
        $sortDirection = $request->input('sort_direction', 'desc');

        if (in_array($sortBy, ['tahun_anggaran', 'tanggal_mulai', 'tanggal_akhir', 'status_rkat'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('tahun_anggaran', 'desc');
        }

        $tahunAnggarans = $query->select(['id_tahun', 'uuid', 'tahun_anggaran', 'tanggal_mulai', 'tanggal_akhir', 'status_rkat'])
            ->paginate($perPage)->onEachSide(0)->withQueryString();

        return Inertia::render('Admin/TahunAnggaran/Index', [
            'tahunAnggarans' => $tahunAnggarans,
            'filters' => [
                'search' => $request->search ?? '',
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }


    public function store(Request $request)
    {
        Log::info('[TahunAnggaran] Membuat data baru.');

        $validated = $request->validate([
            'tahun_anggaran' => [
                'required',
                'integer',
                Rule::unique('tahun_anggarans', 'tahun_anggaran')->whereNull('deleted_at'),
            ],
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
            'indikator_labels' => 'nullable|array',
            'indikator_labels.past' => 'nullable|string|max:100',
            'indikator_labels.current' => 'nullable|string|max:100',
            'indikator_labels.future' => 'nullable|string|max:100',
        ], [
            'tahun_anggaran.unique' => 'Tahun Anggaran ini sudah terdaftar dan masih aktif.',
        ]);

        $y = (int) $validated['tahun_anggaran'];
        if (empty($validated['indikator_labels']) || empty($validated['indikator_labels']['past'])) {
            $validated['indikator_labels'] = [
                'past' => (string) ($y - 1),
                'current' => "Tahun {$y}",
                'future' => "Akhir " . ($y + 3),
            ];
        }

        $existingRecord = TahunAnggaran::withTrashed()
            ->where('tahun_anggaran', $validated['tahun_anggaran'])
            ->first();

        if ($existingRecord && $existingRecord->trashed()) {
            $existingRecord->restore();
            $existingRecord->update($validated);
            Log::info("[TahunAnggaran] Mengaktifkan kembali (restore) tahun_anggaran {$validated['tahun_anggaran']} yang sebelumnya dihapus.");
        } else {
            TahunAnggaran::create($validated);
        }

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

        $y = (int) $tahun->tahun_anggaran;
        if (empty($validated['indikator_labels']) || empty($validated['indikator_labels']['past'])) {
            $validated['indikator_labels'] = [
                'past' => (string) ($y - 1),
                'current' => "Tahun {$y}",
                'future' => "Akhir " . ($y + 3),
            ];
        }

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
