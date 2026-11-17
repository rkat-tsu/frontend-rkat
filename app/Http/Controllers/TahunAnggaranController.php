<?php

namespace App\Http\Controllers;

use App\Models\TahunAnggaran;
use App\Http\Controllers\Concerns\PreservesPagination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TahunAnggaranController extends Controller
{
    use PreservesPagination;

    public function index(Request $request)
    {
        $this->rememberPaginationQuery($request, 'tahun_anggaran');
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
            'indikator_labels.col_kondisi' => 'nullable|string|max:150',
            'indikator_labels.col_renstra' => 'nullable|string|max:150',
            'indikator_labels.col_akreditasi' => 'nullable|string|max:150',
            'indikator_labels.col_gap' => 'nullable|string|max:150',
            'indikator_labels.col_kpi' => 'nullable|string|max:150',
        ], [
            'tahun_anggaran.unique' => 'Tahun Anggaran ini sudah terdaftar dan masih aktif.',
        ]);

        $y = (int) $validated['tahun_anggaran'];
        $validated['indikator_labels'] = array_merge([
            'col_kondisi' => "Kondisi Tahun " . ($y - 1),
            'col_renstra' => "RENSTRA Tahun {$y}",
            'col_akreditasi' => 'Kontribusi Akreditasi',
            'col_gap' => 'Kontribusi GAP',
            'col_kpi' => 'Kontribusi KPI',
        ], $validated['indikator_labels'] ?? []);

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

        return $this->redirectToPaginatedList($request, 'tahun_anggaran', 'tahun.index')->with('success', 'Tahun Anggaran berhasil ditambahkan.');
    }


    public function update(Request $request, TahunAnggaran $tahun)
    {
        Log::info('[TahunAnggaran] Request Update UUID: '.$tahun->uuid);

        $validated = $request->validate([
            'tanggal_mulai' => 'required|date',
            'tanggal_akhir' => 'required|date|after_or_equal:tanggal_mulai',
            'status_rkat' => ['required', Rule::in(['Drafting', 'Submission', 'Approved', 'Closed'])],
            'indikator_labels' => 'nullable|array',
            'indikator_labels.col_kondisi'    => 'nullable|string|max:150',
            'indikator_labels.col_renstra'    => 'nullable|string|max:150',
            'indikator_labels.col_akreditasi' => 'nullable|string|max:150',
            'indikator_labels.col_gap'        => 'nullable|string|max:150',
            'indikator_labels.col_kpi'        => 'nullable|string|max:150',
        ]);

        $y = (int) $tahun->tahun_anggaran;
        $validated['indikator_labels'] = array_merge([
            'col_kondisi' => "Kondisi Tahun " . ($y - 1),
            'col_renstra' => "RENSTRA Tahun {$y}",
            'col_akreditasi' => 'Kontribusi Akreditasi',
            'col_gap' => 'Kontribusi GAP',
            'col_kpi' => 'Kontribusi KPI',
        ], $validated['indikator_labels'] ?? []);

        $tahun->fill($validated)->save();

        Log::info('[TahunAnggaran] Berhasil update data.');

        return $this->redirectToPaginatedList($request, 'tahun_anggaran', 'tahun.index')->with('success', 'Tahun Anggaran berhasil diperbarui.');
    }

    public function destroy(Request $request, TahunAnggaran $tahun)
    {
        TahunAnggaran::destroy($tahun->id_tahun);

        return $this->redirectToPaginatedList($request, 'tahun_anggaran', 'tahun.index')->with('success', 'Data berhasil dihapus.');
    }
}
