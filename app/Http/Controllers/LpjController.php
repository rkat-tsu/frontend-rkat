<?php

namespace App\Http\Controllers;

use App\Models\Lpj;
use App\Models\LpjItem;
use App\Models\PencairanDana;
use App\Models\TahunAnggaran;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class LpjController extends Controller
{
    /**
     * Display a listing of LPJ records.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Lpj::with([
            'pencairanDana.rkatHeader.unit',
            'pencairanDana.items.rkatRabItem',
            'pengaju',
            'approver',
            'items.pencairanItem.rkatRabItem'
        ]);

        // Filter berdasarkan wewenang Unit / Peran
        if ($user->peran !== 'Admin' && !$user->isApprover()) {
            $query->whereHas('pencairanDana.rkatHeader', function ($q) use ($user) {
                $q->where('id_unit', $user->id_unit);
            });
        }

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nomor_lpj', 'like', "%{$search}%")
                  ->orWhere('judul_lpj', 'like', "%{$search}%")
                  ->orWhereHas('pencairanDana.rkatHeader', function ($rq) use ($search) {
                      $rq->where('nomor_dokumen', 'like', "%{$search}%")
                        ->orWhereHas('unit', function ($uq) use ($search) {
                            $uq->where('nama_unit', 'like', "%{$search}%");
                        });
                  });
            });
        }

        // Filter Tahun Anggaran
        if ($request->filled('tahun')) {
            $tahun = $request->tahun;
            $query->whereHas('pencairanDana.rkatHeader', function ($q) use ($tahun) {
                $q->where('tahun_anggaran', $tahun);
            });
        }

        // Filter Status LPJ
        if ($request->filled('status')) {
            $query->where('status_lpj', $request->status);
        }

        // Filter Unit
        if ($request->filled('unit_id')) {
            $unitId = $request->unit_id;
            $query->whereHas('pencairanDana.rkatHeader', function ($q) use ($unitId) {
                $q->where('id_unit', $unitId);
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        if ($sortBy === 'unit') {
            $query->join('pencairan_danas', 'lpjs.id_pencairan', '=', 'pencairan_danas.id_pencairan')
                  ->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header')
                  ->join('unit', 'rkat_headers.id_unit', '=', 'unit.id_unit')
                  ->orderBy('unit.nama_unit', $sortDirection)
                  ->select('lpjs.*');
        } elseif (in_array($sortBy, ['nomor_lpj', 'tanggal_lpj', 'status_lpj', 'total_realisasi', 'sisa_dana', 'created_at'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->input('per_page', 15);
        $lpjs = $query->paginate($perPage)->onEachSide(0)->withQueryString();

        // Statistical Summaries
        $baseStatsQuery = Lpj::query();
        if ($user->peran !== 'Admin' && !$user->isApprover()) {
            $baseStatsQuery->whereHas('pencairanDana.rkatHeader', function ($q) use ($user) {
                $q->where('id_unit', $user->id_unit);
            });
        }

        $allLpjs = $baseStatsQuery->get();
        $stats = [
            'total_lpj' => $allLpjs->count(),
            'total_pencairan' => $allLpjs->sum('total_pencairan'),
            'total_realisasi' => $allLpjs->sum('total_realisasi'),
            'total_sisa' => $allLpjs->sum('sisa_dana'),
            'draft' => $allLpjs->where('status_lpj', 'Draft')->count(),
            'diajukan' => $allLpjs->where('status_lpj', 'Diajukan')->count(),
            'disetujui' => $allLpjs->where('status_lpj', 'Disetujui')->count(),
            'revisi' => $allLpjs->where('status_lpj', 'Revisi')->count(),
            'ditolak' => $allLpjs->where('status_lpj', 'Ditolak')->count(),
        ];

        // Fetch Pencairan Dana yang siap dibuatkan LPJ (status_pencairan = Disetujui_Final dan belum punya LPJ final)
        $pencairanQuery = PencairanDana::with([
            'rkatHeader.unit',
            'items.rkatRabItem',
            'lpj'
        ])->where('status_pencairan', 'Disetujui_Final');

        if ($user->peran !== 'Admin' && !$user->isApprover()) {
            $pencairanQuery->whereHas('rkatHeader', function ($q) use ($user) {
                $q->where('id_unit', $user->id_unit);
            });
        }

        $availablePencairans = $pencairanQuery->get()->filter(function ($pencairan) {
            // Bebas jika belum ada LPJ atau LPJ-nya Ditolak
            return !$pencairan->lpj || $pencairan->lpj->status_lpj === 'Ditolak';
        })->map(function ($pencairan) {
            $totalPencairan = $pencairan->items->sum('sub_total_pencairan');
            return [
                'id_pencairan' => $pencairan->id_pencairan,
                'uuid' => $pencairan->uuid,
                'nama_pencairan' => $pencairan->nama_pencairan,
                'nomor_dokumen_rkat' => $pencairan->rkatHeader->nomor_dokumen ?? '-',
                'unit_name' => $pencairan->rkatHeader->unit->nama_unit ?? '-',
                'tahun_anggaran' => $pencairan->rkatHeader->tahun_anggaran ?? '-',
                'tanggal_pengajuan' => $pencairan->tanggal_pengajuan ? $pencairan->tanggal_pengajuan->format('Y-m-d') : '-',
                'total_pencairan' => $totalPencairan,
                'items' => $pencairan->items->map(function ($item) {
                    return [
                        'id_pencairan_item' => $item->id_pencairan_item,
                        'deskripsi_item' => $item->rkatRabItem->deskripsi_item ?? 'Item Anggaran',
                        'satuan' => $item->rkatRabItem->satuan ?? 'Satuan',
                        'volume_pencairan' => $item->volume_pencairan,
                        'nominal_pencairan' => $item->nominal_pencairan,
                        'sub_total_pencairan' => $item->sub_total_pencairan,
                    ];
                })
            ];
        })->values();

        $tahunAnggarans = TahunAnggaran::pluck('tahun_anggaran')->toArray();
        $units = Unit::select(['id_unit', 'nama_unit'])->get();

        return Inertia::render('Lpj/Index', [
            'lpjs' => $lpjs,
            'stats' => $stats,
            'availablePencairans' => $availablePencairans,
            'filters' => $request->only(['search', 'tahun', 'status', 'unit_id', 'per_page', 'sort_by', 'sort_direction']),
            'tahunAnggarans' => $tahunAnggarans,
            'units' => $units,
        ]);
    }

    /**
     * Store a newly created LPJ in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'id_pencairan' => 'required|exists:pencairan_danas,id_pencairan',
            'judul_lpj' => 'required|string|max:255',
            'tanggal_lpj' => 'required|date',
            'tanggal_pelaksanaan_mulai' => 'nullable|date',
            'tanggal_pelaksanaan_selesai' => 'nullable|date',
            'lokasi_kegiatan' => 'nullable|string|max:255',
            'ringkasan_kegiatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id_pencairan_item' => 'required|exists:pencairan_dana_items,id_pencairan_item',
            'items.*.volume_realisasi' => 'required|numeric|min:0',
            'items.*.harga_satuan_realisasi' => 'required|numeric|min:0',
            'items.*.nomor_kwitansi' => 'nullable|string|max:100',
            'items.*.keterangan' => 'nullable|string',
            'dokumen_bukti' => 'nullable|array',
        ]);

        $pencairan = PencairanDana::with('rkatHeader.unit')->findOrFail($request->id_pencairan);

        if ($user->peran !== 'Admin' && $pencairan->rkatHeader->id_unit !== $user->id_unit) {
            abort(403, 'Anda tidak memiliki wewenang untuk membuat LPJ dari unit ini.');
        }

        // Generate Nomor LPJ
        $unitCode = strtoupper($pencairan->rkatHeader->unit->singkatan_unit ?? 'UNIT');
        $year = date('Y', strtotime($request->tanggal_lpj));
        $countToday = Lpj::whereYear('created_at', date('Y'))->count() + 1;
        $nomorLpj = sprintf("LPJ/%s/%s/%04d", $year, $unitCode, $countToday);

        // Compute total pencairan vs total realisasi
        $totalPencairan = 0;
        $totalRealisasi = 0;

        foreach ($request->items as $itemData) {
            $pencairanItem = \App\Models\PencairanDanaItem::findOrFail($itemData['id_pencairan_item']);
            $subTotalPencairan = (float) $pencairanItem->sub_total_pencairan;
            $subTotalRealisasi = (float) $itemData['volume_realisasi'] * (float) $itemData['harga_satuan_realisasi'];

            $totalPencairan += $subTotalPencairan;
            $totalRealisasi += $subTotalRealisasi;
        }

        $sisaDana = $totalPencairan - $totalRealisasi;

        $lpj = Lpj::create([
            'id_pencairan' => $request->id_pencairan,
            'nomor_lpj' => $nomorLpj,
            'judul_lpj' => $request->judul_lpj,
            'tanggal_lpj' => $request->tanggal_lpj,
            'tanggal_pelaksanaan_mulai' => $request->tanggal_pelaksanaan_mulai,
            'tanggal_pelaksanaan_selesai' => $request->tanggal_pelaksanaan_selesai,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'ringkasan_kegiatan' => $request->ringkasan_kegiatan,
            'total_pencairan' => $totalPencairan,
            'total_realisasi' => $totalRealisasi,
            'sisa_dana' => $sisaDana,
            'status_lpj' => 'Draft',
            'dokumen_bukti' => $request->dokumen_bukti ?? [],
            'diajukan_oleh' => Auth::id(),
        ]);

        foreach ($request->items as $itemData) {
            $pencairanItem = \App\Models\PencairanDanaItem::findOrFail($itemData['id_pencairan_item']);
            $subTotalRealisasi = (float) $itemData['volume_realisasi'] * (float) $itemData['harga_satuan_realisasi'];
            $selisih = (float) $pencairanItem->sub_total_pencairan - $subTotalRealisasi;

            LpjItem::create([
                'id_lpj' => $lpj->id_lpj,
                'id_pencairan_item' => $itemData['id_pencairan_item'],
                'volume_realisasi' => $itemData['volume_realisasi'],
                'harga_satuan_realisasi' => $itemData['harga_satuan_realisasi'],
                'sub_total_realisasi' => $subTotalRealisasi,
                'selisih' => $selisih,
                'nomor_kwitansi' => $itemData['nomor_kwitansi'] ?? null,
                'keterangan' => $itemData['keterangan'] ?? null,
            ]);
        }

        return redirect()->route('lpj.index')->with('success', 'Dokumen LPJ berhasil dibuat sebagai Draft.');
    }

    /**
     * Display the specified LPJ record.
     */
    public function show(Lpj $lpj)
    {
        $lpj->load([
            'pencairanDana.rkatHeader.unit',
            'pengaju',
            'approver',
            'items.pencairanItem.rkatRabItem'
        ]);

        return response()->json([
            'lpj' => $lpj
        ]);
    }

    /**
     * Update the specified LPJ record in storage.
     */
    public function update(Request $request, Lpj $lpj)
    {
        $user = Auth::user();

        if ($lpj->status_lpj !== 'Draft' && $lpj->status_lpj !== 'Revisi') {
            return redirect()->back()->with('error', 'Hanya LPJ berkategori Draft atau Revisi yang dapat diperbarui.');
        }

        $unitLpj = $lpj->pencairanDana?->rkatHeader?->id_unit;

        if ($user->peran !== 'Admin' && $lpj->diajukan_oleh !== $user->id_user && $user->id_unit !== $unitLpj) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengubah LPJ ini.');
        }

        $request->validate([
            'judul_lpj' => 'required|string|max:255',
            'tanggal_lpj' => 'required|date',
            'tanggal_pelaksanaan_mulai' => 'nullable|date',
            'tanggal_pelaksanaan_selesai' => 'nullable|date',
            'lokasi_kegiatan' => 'nullable|string|max:255',
            'ringkasan_kegiatan' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.id_pencairan_item' => 'required|exists:pencairan_dana_items,id_pencairan_item',
            'items.*.volume_realisasi' => 'required|numeric|min:0',
            'items.*.harga_satuan_realisasi' => 'required|numeric|min:0',
            'items.*.nomor_kwitansi' => 'nullable|string|max:100',
            'items.*.keterangan' => 'nullable|string',
            'dokumen_bukti' => 'nullable|array',
        ]);

        $totalPencairan = 0;
        $totalRealisasi = 0;

        foreach ($request->items as $itemData) {
            $pencairanItem = \App\Models\PencairanDanaItem::findOrFail($itemData['id_pencairan_item']);
            $subTotalPencairan = (float) $pencairanItem->sub_total_pencairan;
            $subTotalRealisasi = (float) $itemData['volume_realisasi'] * (float) $itemData['harga_satuan_realisasi'];

            $totalPencairan += $subTotalPencairan;
            $totalRealisasi += $subTotalRealisasi;
        }

        $sisaDana = $totalPencairan - $totalRealisasi;

        $lpj->update([
            'judul_lpj' => $request->judul_lpj,
            'tanggal_lpj' => $request->tanggal_lpj,
            'tanggal_pelaksanaan_mulai' => $request->tanggal_pelaksanaan_mulai,
            'tanggal_pelaksanaan_selesai' => $request->tanggal_pelaksanaan_selesai,
            'lokasi_kegiatan' => $request->lokasi_kegiatan,
            'ringkasan_kegiatan' => $request->ringkasan_kegiatan,
            'total_pencairan' => $totalPencairan,
            'total_realisasi' => $totalRealisasi,
            'sisa_dana' => $sisaDana,
            'dokumen_bukti' => $request->dokumen_bukti ?? [],
        ]);

        $lpj->items()->delete();

        foreach ($request->items as $itemData) {
            $pencairanItem = \App\Models\PencairanDanaItem::findOrFail($itemData['id_pencairan_item']);
            $subTotalRealisasi = (float) $itemData['volume_realisasi'] * (float) $itemData['harga_satuan_realisasi'];
            $selisih = (float) $pencairanItem->sub_total_pencairan - $subTotalRealisasi;

            LpjItem::create([
                'id_lpj' => $lpj->id_lpj,
                'id_pencairan_item' => $itemData['id_pencairan_item'],
                'volume_realisasi' => $itemData['volume_realisasi'],
                'harga_satuan_realisasi' => $itemData['harga_satuan_realisasi'],
                'sub_total_realisasi' => $subTotalRealisasi,
                'selisih' => $selisih,
                'nomor_kwitansi' => $itemData['nomor_kwitansi'] ?? null,
                'keterangan' => $itemData['keterangan'] ?? null,
            ]);
        }

        return redirect()->route('lpj.index')->with('success', 'Dokumen LPJ berhasil diperbarui.');
    }

    /**
     * Submit LPJ to status 'Diajukan'.
     */
    public function submit(Lpj $lpj)
    {
        $user = Auth::user();

        if ($lpj->status_lpj !== 'Draft' && $lpj->status_lpj !== 'Revisi') {
            return redirect()->back()->with('error', 'Hanya LPJ berkategori Draft atau Revisi yang dapat diajukan.');
        }

        $unitLpj = $lpj->pencairanDana?->rkatHeader?->id_unit;

        if ($user->peran !== 'Admin' && $lpj->diajukan_oleh !== $user->id_user && $user->id_unit !== $unitLpj) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengajukan LPJ ini.');
        }

        $lpj->update([
            'status_lpj' => 'Diajukan',
            'tanggal_pengajuan' => now(),
        ]);

        return redirect()->route('lpj.index')->with('success', 'Dokumen LPJ berhasil diajukan untuk persetujuan.');
    }

    /**
     * Approve, Revise, or Reject an LPJ record.
     */
    public function approve(Request $request, Lpj $lpj)
    {
        $user = Auth::user();

        if (!$user->isApprover() && $user->peran !== 'Admin') {
            abort(403, 'Anda tidak memiliki hak wewenang untuk menyetujui LPJ ini.');
        }

        $request->validate([
            'aksi' => 'required|in:Disetujui,Revisi,Ditolak',
            'catatan' => 'nullable|string',
        ]);

        if (in_array($request->aksi, ['Revisi', 'Ditolak']) && empty($request->catatan)) {
            return redirect()->back()->with('error', 'Catatan wajib diisi apabila melakukan revisi atau penolakan.');
        }

        $lpj->update([
            'status_lpj' => $request->aksi,
            'catatan' => $request->catatan ?? null,
            'disetujui_oleh' => Auth::id(),
            'tanggal_persetujuan' => now(),
        ]);

        $msg = match ($request->aksi) {
            'Disetujui' => 'Dokumen LPJ berhasil disetujui.',
            'Revisi' => 'Dokumen LPJ dikembalikan untuk revisi.',
            'Ditolak' => 'Dokumen LPJ telah ditolak.',
        };

        return redirect()->route('lpj.index')->with('success', $msg);
    }

    /**
     * Export LPJ to PDF format.
     */
    public function exportPdf(Lpj $lpj)
    {
        try {
            ini_set('memory_limit', '512M');

            $lpj->load([
                'pencairanDana.rkatHeader.unit',
                'pengaju',
                'approver',
                'items.pencairanItem.rkatRabItem'
            ]);

            $pdf = Pdf::loadView('pdf.lpj', ['lpj' => $lpj]);
            $pdf->setPaper('a4', 'portrait');

            $filename = 'LPJ_' . str_replace('/', '_', $lpj->nomor_lpj) . '.pdf';
            return $pdf->download($filename);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal membuat dokumen PDF LPJ: ' . $e->getMessage());
        }
    }
}
