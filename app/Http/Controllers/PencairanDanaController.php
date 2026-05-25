<?php

namespace App\Http\Controllers;

use App\Models\PencairanDana;
use App\Models\RkatHeader;
use App\Models\TahunAnggaran;
use App\Models\Unit;
use App\Models\ApprovalPathStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PencairanDanaController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = PencairanDana::with([
            'rkatHeader.unit',
            'pengaju'
        ]);

        if ($user->peran !== 'Admin') {
            $query->whereHas('rkatHeader', function ($q) use ($user) {
                $q->where('id_unit', $user->id_unit);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('rkatHeader', function ($q) use ($search) {
                $q->where('nomor_dokumen', 'like', "%{$search}%")
                  ->orWhereHas('unit', function ($qu) use ($search) {
                      $qu->where('nama_unit', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('tahun')) {
            $tahun = $request->tahun;
            $query->whereHas('rkatHeader', function ($q) use ($tahun) {
                $q->where('tahun_anggaran', $tahun);
            });
        }

        if ($request->filled('status')) {
            $query->where('status_pencairan', $request->status);
        }

        if ($request->filled('unit_id')) {
            $unit_id = $request->unit_id;
            $query->whereHas('rkatHeader', function ($q) use ($unit_id) {
                $q->where('id_unit', $unit_id);
            });
        }

        $pencairans = $query->orderBy('created_at', 'desc')->paginate(15);
        $tahunAnggarans = TahunAnggaran::pluck('tahun_anggaran', null)->toArray();
        $units = Unit::select(['id_unit', 'nama_unit'])->get();

        $dynamicSteps = ApprovalPathStep::select('step_name')->distinct()->pluck('step_name')->toArray();
        $statuses = array_values(array_unique(array_merge(['Draft', 'Revisi', 'Disetujui_Final', 'Ditolak'], $dynamicSteps)));

        return Inertia::render('Pencairan/Index', [
            'pencairans' => $pencairans,
            'filters' => $request->only(['search', 'tahun', 'status', 'unit_id']),
            'tahunAnggarans' => $tahunAnggarans,
            'units' => $units,
            'statuses' => $statuses,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        $query = RkatHeader::with(['unit', 'rkatDetails.rabItems.pencairanDanaItems' => function($q) {
            $q->whereHas('pencairanDana', function($q2) {
                $q2->where('status_pencairan', '!=', 'Ditolak');
            });
        }])->where('status_persetujuan', 'Disetujui_Final');

        if ($user->peran !== 'Admin') {
            $query->where('id_unit', $user->id_unit);
        }

        $rkatList = $query->get()->map(function($rkat) {
            $total_anggaran = 0;
            $total_tercairkan = 0;
            $items = [];
            foreach ($rkat->rkatDetails as $detail) {
                foreach ($detail->rabItems as $item) {
                    $usedVolume = $item->pencairanDanaItems->sum('volume_pencairan');
                    $usedNominal = $item->pencairanDanaItems->sum('sub_total_pencairan');
                    $total_anggaran += $item->sub_total;
                    $total_tercairkan += $usedNominal;
                    
                    if ($item->sub_total > $usedNominal) {
                        $items[] = [
                            'id' => $item->id,
                            'deskripsi_item' => $item->deskripsi_item,
                            'harga_satuan' => $item->harga_satuan,
                            'volume' => $item->volume,
                            'sub_total' => $item->sub_total,
                            'used_volume' => $usedVolume,
                            'used_nominal' => $usedNominal,
                            'remaining_volume' => $item->volume - $usedVolume,
                            'remaining_nominal' => $item->sub_total - $usedNominal,
                        ];
                    }
                }
            }
            return [
                'id_header' => $rkat->id_header,
                'nomor_dokumen' => $rkat->nomor_dokumen,
                'unit' => $rkat->unit,
                'total_anggaran' => $total_anggaran,
                'total_tercairkan' => $total_tercairkan,
                'sisa_anggaran' => $total_anggaran - $total_tercairkan,
                'rab_items' => $items
            ];
        })->filter(function($rkat) {
            return count($rkat['rab_items']) > 0;
        })->values();

        return Inertia::render('Pencairan/Create', [
            'rkatList' => $rkatList
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'id_header' => 'required|exists:rkat_headers,id_header',
            'nama_pencairan' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:rkat_rab_items,id',
            'items.*.volume_pencairan' => 'required|numeric|min:1',
            'items.*.nominal_pencairan' => 'required|numeric|min:0',
        ]);

        $rkat = RkatHeader::findOrFail($request->id_header);

        if ($user->peran !== 'Admin' && $rkat->id_unit !== $user->id_unit) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengajukan pencairan untuk unit ini.');
        }

        // Validate items remaining budget
        foreach ($request->items as $reqItem) {
            $rabItem = \App\Models\RkatRabItem::findOrFail($reqItem['id']);
            $usedVolume = $rabItem->pencairanDanaItems()->whereHas('pencairanDana', function($q){
                $q->where('status_pencairan', '!=', 'Ditolak');
            })->sum('volume_pencairan');
            $usedSubTotal = $rabItem->pencairanDanaItems()->whereHas('pencairanDana', function($q){
                $q->where('status_pencairan', '!=', 'Ditolak');
            })->sum('sub_total_pencairan');
            
            $remainingVolume = $rabItem->volume - $usedVolume;
            $remainingSubTotal = $rabItem->sub_total - $usedSubTotal;
            $reqSubTotal = $reqItem['volume_pencairan'] * $reqItem['nominal_pencairan'];
            
            if ($reqItem['volume_pencairan'] > $remainingVolume) {
                return redirect()->back()->with('error', 'Volume pencairan untuk "' . $rabItem->deskripsi_item . '" melebihi sisa volume (Sisa: ' . $remainingVolume . ').');
            }
            if ($reqSubTotal > $remainingSubTotal) {
                return redirect()->back()->with('error', 'Sub total pencairan untuk "' . $rabItem->deskripsi_item . '" melebihi sisa anggaran.');
            }
        }

        $pencairan = PencairanDana::create([
            'id_header' => $request->id_header,
            'diajukan_oleh' => Auth::id(),
            'nama_pencairan' => $request->nama_pencairan,
            'status_pencairan' => 'Draft',
        ]);

        foreach ($request->items as $reqItem) {
            $subTotal = $reqItem['volume_pencairan'] * $reqItem['nominal_pencairan'];
            \App\Models\PencairanDanaItem::create([
                'id_pencairan' => $pencairan->id_pencairan,
                'id_rkat_rab_item' => $reqItem['id'],
                'volume_pencairan' => $reqItem['volume_pencairan'],
                'nominal_pencairan' => $reqItem['nominal_pencairan'],
                'sub_total_pencairan' => $subTotal,
            ]);
        }

        return redirect()->route('pencairan.index')->with('success', 'Pencairan Dana berhasil dibuat sebagai Draft.');
    }

    public function show(PencairanDana $pencairan)
    {
        $user = Auth::user();
        $pencairan->load([
            'rkatHeader.unit',
            'rkatHeader.rkatDetails.iku',
            'rkatHeader.rkatDetails.ikk',
            'rkatHeader.rkatDetails.indikators',
            'rkatHeader.rkatDetails.rabItems',
            'items.rkatRabItem',
            'pengaju'
        ]);

        if ($user->peran !== 'Admin' && $pencairan->rkatHeader->id_unit !== $user->id_unit) {
            $isBaak = $user->unit && stripos($user->unit->nama_unit, 'BAAK') !== false && $user->isUnitHead();
            $isBauk = $user->unit && stripos($user->unit->nama_unit, 'BAUK') !== false && $user->isUnitHead();
            $isWr2 = $user->peran === 'WR_2';
            
            $isParentUnit = false;
            if ($user->unit && $user->isUnitHead()) {
                $isParentUnit = $user->unit->children()->where('id_unit', $pencairan->rkatHeader->id_unit)->exists();
            }

            if (!$isBaak && !$isBauk && !$isWr2 && !$isParentUnit) {
                abort(403, 'Anda tidak memiliki hak akses untuk melihat dokumen pencairan ini.');
            }
        }

        return Inertia::render('Pencairan/Show', [
            'pencairan' => $pencairan
        ]);
    }

    public function submit(PencairanDana $pencairan)
    {
        if ($pencairan->status_pencairan !== 'Draft' && $pencairan->status_pencairan !== 'Revisi') {
            return redirect()->back()->with('error', 'Hanya dokumen Draft atau Revisi yang dapat diajukan.');
        }

        $pencairan->fill([
            'status_pencairan' => 'Menunggu_BAAK',
            'tanggal_pengajuan' => now()
        ])->save();

        return redirect()->route('pencairan.index')->with('success', 'Pencairan Dana berhasil diajukan ke BAAK.');
    }

    // Fungsi Approval
    public function approve(Request $request, PencairanDana $pencairan)
    {
        // Validasi akses user
        $user = Auth::user();
        
        $request->validate([
            'aksi' => 'required|in:Setuju,Tolak,Revisi',
            'catatan' => 'nullable|string'
        ]);

        if ($request->aksi === 'Revisi' || $request->aksi === 'Tolak') {
            $request->validate([
                'catatan' => 'required|string'
            ]);
        }

        if ($request->aksi === 'Tolak') {
            $pencairan->fill([
                'status_pencairan' => 'Ditolak',
                'catatan' => $request->catatan
            ])->save();
            return redirect()->back()->with('success', 'Pencairan Dana ditolak.');
        }

        if ($request->aksi === 'Revisi') {
            $pencairan->fill([
                'status_pencairan' => 'Revisi',
                'catatan' => $request->catatan
            ])->save();
            return redirect()->back()->with('success', 'Pencairan Dana dikembalikan untuk revisi.');
        }

        // Simpan catatan jika ada (meskipun disetujui)
        $pencairan->fill([
            'catatan' => $request->catatan ?? null
        ])->save();

        // Logic Setuju (Maju ke step berikutnya)
        $approvalDates = $pencairan->approval_dates ?? [];
        
        switch ($pencairan->status_pencairan) {
            case 'Menunggu_BAAK':
                $approvalDates['Menunggu_BAAK'] = now()->toDateTimeString();
                $pencairan->fill([
                    'status_pencairan' => 'Menunggu_Unit_Menaungi',
                    'approval_dates' => $approvalDates
                ])->save();
                break;
            case 'Menunggu_Unit_Menaungi':
                $approvalDates['Menunggu_Unit_Menaungi'] = now()->toDateTimeString();
                $pencairan->fill([
                    'status_pencairan' => 'Menunggu_BAUK',
                    'approval_dates' => $approvalDates
                ])->save();
                break;
            case 'Menunggu_BAUK':
                $approvalDates['Menunggu_BAUK'] = now()->toDateTimeString();
                $pencairan->fill([
                    'status_pencairan' => 'Menunggu_WR2',
                    'approval_dates' => $approvalDates
                ])->save();
                break;
            case 'Menunggu_WR2':
                $approvalDates['Menunggu_WR2'] = now()->toDateTimeString();
                $pencairan->fill([
                    'status_pencairan' => 'Disetujui_Final',
                    'approval_dates' => $approvalDates
                ])->save();
                break;
        }

        return redirect()->back()->with('success', 'Pencairan Dana berhasil disetujui.');
    }
    
    // Approval khusus Pencairan
    public function approvalIndex()
    {
        $user = Auth::user();
        
        // Cek otorisasi akses menu persetujuan
        $isBaak = $user->unit && stripos($user->unit->nama_unit, 'BAAK') !== false && $user->isUnitHead();
        $isBauk = $user->unit && stripos($user->unit->nama_unit, 'BAUK') !== false && $user->isUnitHead();
        $isWr2 = $user->peran === 'WR_2';
        $isParentUnit = $user->unit && $user->isUnitHead() && $user->unit->children()->exists();

        if ($user->peran !== 'Admin' && !$isBaak && !$isBauk && !$isWr2 && !$isParentUnit) {
            abort(403, 'Anda tidak memiliki hak akses ke halaman persetujuan pencairan.');
        }

        $query = PencairanDana::with(['rkatHeader.unit', 'pengaju']);
        
        // Logika melihat data yang perlu di-approve sesuai peran/unit user.
        if ($user->peran === 'Admin') {
            $query->whereIn('status_pencairan', [
                'Menunggu_BAAK', 'Menunggu_Unit_Menaungi', 'Menunggu_BAUK', 'Menunggu_WR2'
            ]);
        } else {
            $statusFilters = [];
            if ($isBaak) $statusFilters[] = 'Menunggu_BAAK';
            if ($isBauk) $statusFilters[] = 'Menunggu_BAUK';
            if ($isWr2) $statusFilters[] = 'Menunggu_WR2';
            
            if ($isParentUnit) {
                // Bisa approve Menunggu_Unit_Menaungi jika dia adalah kepala dari parent_id unit RKAT.
                $childUnitIds = $user->unit ? $user->unit->children->pluck('id_unit')->toArray() : [];
                $unitAksesIds = array_merge([$user->id_unit], $childUnitIds);
                
                $query->where(function($q) use ($statusFilters, $unitAksesIds) {
                    if (!empty($statusFilters)) {
                        $q->whereIn('status_pencairan', $statusFilters);
                    }
                    $q->orWhere(function($subQ) use ($unitAksesIds) {
                        $subQ->where('status_pencairan', 'Menunggu_Unit_Menaungi')
                             ->whereHas('rkatHeader', function($rkatQ) use ($unitAksesIds) {
                                 $rkatQ->whereIn('id_unit', $unitAksesIds);
                             });
                    });
                });
            } else {
                 $query->whereIn('status_pencairan', empty($statusFilters) ? ['none'] : $statusFilters);
            }
        }
        
        $pencairans = $query->latest()->get();
        
        return Inertia::render('Pencairan/Approval', [
            'pencairans' => $pencairans
        ]);
    }
    
    public function exportPdf(PencairanDana $pencairan)
    {
        try {
            ini_set('memory_limit', '512M');

            $pencairan->load([
                'rkatHeader.unit',
                'rkatHeader.rkatDetails.iku',
                'rkatHeader.rkatDetails.ikk',
                'items.rkatRabItem',
                'pengaju'
            ]);

            $pdf = Pdf::loadView('pdf.pencairan', ['pencairan' => $pencairan]);
            $pdf->setPaper('a4', 'portrait');

            return $pdf->download('Pencairan_Dana_' . $pencairan->rkatHeader->nomor_dokumen . '.pdf');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal export PDF: ' . $e->getMessage());
        }
    }
}
