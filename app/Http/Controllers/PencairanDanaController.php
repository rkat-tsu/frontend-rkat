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
            $isParentUnit = false;
            if ($user->unit && $user->isUnitHead()) {
                $isParentUnit = $user->unit->children()->where('id_unit', $pencairan->rkatHeader->id_unit)->exists();
            }

            $hasAccess = $isParentUnit;

            // Check if user is in any step of the dynamic approval path
            if (!$hasAccess && $pencairan->rkatHeader->unit && $pencairan->rkatHeader->unit->pencairanApprovalPath) {
                $steps = $pencairan->rkatHeader->unit->pencairanApprovalPath->steps;
                foreach ($steps as $step) {
                    if ($step->approver_type === 'role' && $step->role_name === $user->peran) $hasAccess = true;
                    if ($step->approver_type === 'unit' && $user->isUnitHead() && $step->unit_id === $user->id_unit) $hasAccess = true;
                }
            }

            if (!$hasAccess) {
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

        $pencairan->load('rkatHeader.unit.pencairanApprovalPath.steps');
        $unit = $pencairan->rkatHeader->unit;
        
        if (!$unit || !$unit->pencairanApprovalPath || $unit->pencairanApprovalPath->steps->isEmpty()) {
            return redirect()->back()->with('error', 'Unit ini tidak memiliki alur persetujuan pencairan yang dikonfigurasi.');
        }

        $firstStep = null;
        foreach ($unit->pencairanApprovalPath->steps->sortBy('order') as $step) {
             if ($step->approver_type === 'parent_unit' && !$unit->requiresParentApproval()) continue;
             $firstStep = $step;
             break;
        }

        if (!$firstStep) {
            return redirect()->back()->with('error', 'Alur persetujuan pencairan tidak valid.');
        }

        $pencairan->fill([
            'status_pencairan' => $firstStep->step_name,
            'current_step_id' => $firstStep->id,
            'tanggal_pengajuan' => now()
        ])->save();

        return redirect()->route('pencairan.index')->with('success', 'Pencairan Dana berhasil diajukan.');
    }

    // Fungsi Approval
    public function approve(Request $request, PencairanDana $pencairan)
    {
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
        
        $pencairan->load('currentStep', 'rkatHeader.unit.pencairanApprovalPath.steps');
        $currentStep = $pencairan->currentStep;
        $isAdminOrRektor = in_array($user->peran, ['Admin', 'Rektor']);

        if (!$isAdminOrRektor) {
            $hasAccess = false;
            if ($currentStep) {
                if ($currentStep->approver_type === 'role' && $currentStep->role_name === $user->peran) $hasAccess = true;
                if ($currentStep->approver_type === 'unit' && $user->isUnitHead() && $currentStep->unit_id === $user->id_unit) $hasAccess = true;
                if ($currentStep->approver_type === 'self_unit_head' && $user->isUnitHead() && $pencairan->rkatHeader->id_unit === $user->id_unit) $hasAccess = true;
                if ($currentStep->approver_type === 'parent_unit' && $user->isUnitHead() && $pencairan->rkatHeader->unit) {
                    // Normal: prodi/sub-unit mengajukan, unit-induk (kepala) menyetujui
                    if ($pencairan->rkatHeader->unit->parent_id === $user->id_unit) $hasAccess = true;
                    // Edge case: unit itu sendiri yang mengajukan (misal F. Vokasi mengajukan),
                    // maka Dekan F. Vokasi tetap menyetujui step parent_unit sebelum naik ke WR
                    if ($pencairan->rkatHeader->unit->id_unit === $user->id_unit) $hasAccess = true;
                }
            }

            if (!$hasAccess) {
                return redirect()->back()->with('error', 'Pencairan ini tidak berada pada tahap persetujuan Anda atau Anda tidak memiliki akses.');
            }
        }

        if ($request->aksi === 'Tolak') {
            $pencairan->fill([
                'status_pencairan' => 'Ditolak',
                'current_step_id' => null,
                'catatan' => $request->catatan
            ])->save();
            return redirect()->back()->with('success', 'Pencairan Dana ditolak.');
        }

        if ($request->aksi === 'Revisi') {
            $pencairan->fill([
                'status_pencairan' => 'Revisi',
                'current_step_id' => null,
                'catatan' => $request->catatan
            ])->save();
            return redirect()->back()->with('success', 'Pencairan Dana dikembalikan untuk revisi.');
        }

        $approvalDates = $pencairan->approval_dates ?? [];
        if ($currentStep) {
            $approvalDates[$currentStep->step_name] = now()->toDateTimeString();
        }

        $nextStep = null;
        if ($currentStep && $pencairan->rkatHeader->unit && $pencairan->rkatHeader->unit->pencairanApprovalPath) {
            $remainingSteps = $pencairan->rkatHeader->unit->pencairanApprovalPath->steps
                ->where('order', '>', $currentStep->order)
                ->sortBy('order');
            
            foreach ($remainingSteps as $step) {
                 if ($step->approver_type === 'parent_unit' && !$pencairan->rkatHeader->unit->requiresParentApproval()) continue;
                 $nextStep = $step;
                 break;
            }
        }

        if ($nextStep) {
            $pencairan->fill([
                'status_pencairan' => $nextStep->step_name,
                'current_step_id' => $nextStep->id,
                'approval_dates' => $approvalDates,
                'catatan' => $request->catatan ?? null
            ])->save();
        } else {
            $pencairan->fill([
                'status_pencairan' => 'Disetujui_Final',
                'current_step_id' => null,
                'approval_dates' => $approvalDates,
                'catatan' => $request->catatan ?? null
            ])->save();
        }

        return redirect()->back()->with('success', 'Pencairan Dana berhasil disetujui.');
    }
    
    // Approval khusus Pencairan
    public function approvalIndex()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $peran = $user->peran;

        if (! $user->isApprover() && ! $user->isAdmin()) {
            abort(403, 'Anda tidak memiliki hak akses untuk halaman ini.');
        }

        $user->loadMissing('unit.children');

        $query = PencairanDana::with([
            'rkatHeader.unit',
            'pengaju',
            'currentStep'
        ]);
        
        if (in_array($peran, ['Admin', 'Rektor'])) {
            $query->whereNotNull('current_step_id');
        } else {
            $query->whereNotNull('current_step_id');
            $query->where(function ($q) use ($user, $peran) {
                $q->orWhereHas('currentStep', function ($stepQ) use ($peran) {
                    $stepQ->where('approver_type', 'role')
                          ->where('role_name', $peran);
                });

                if ($user->isUnitHead()) {
                    $q->orWhereHas('currentStep', function ($stepQ) use ($user) {
                        $stepQ->where('approver_type', 'unit')
                              ->where('unit_id', $user->id_unit);
                    });

                    $q->orWhere(function ($selfQ) use ($user) {
                        $selfQ->whereHas('currentStep', function ($stepQ) {
                            $stepQ->where('approver_type', 'self_unit_head');
                        })->whereHas('rkatHeader', function ($headerQ) use ($user) {
                            $headerQ->where('id_unit', $user->id_unit);
                        });
                    });

                    $q->orWhere(function ($parentQ) use ($user) {
                        $parentQ->whereHas('currentStep', function ($stepQ) {
                            $stepQ->where('approver_type', 'parent_unit');
                        })->whereHas('rkatHeader.unit', function ($unitQ) use ($user) {
                            // Normal: unit anak mengajukan, kepala unit-induk menyetujui
                            // Edge case: unit itu sendiri yang mengajukan (F. Vokasi mengajukan sendiri)
                            $unitQ->where('parent_id', $user->id_unit)
                                  ->orWhere('id_unit', $user->id_unit);
                        });
                    });
                }
            });
        }
        
        $pencairans = $query->latest('updated_at')->get();
        
        // Filter di memory
        if (!in_array($peran, ['Admin', 'Rektor'])) {
            $pencairans = $pencairans->filter(function ($pencairan) use ($user, $peran) {
                $step = $pencairan->currentStep;
                if (!$step) return false;
                
                if ($step->approver_type === 'role') return $step->role_name === $peran;
                if ($step->approver_type === 'unit') return $user->isUnitHead() && $step->unit_id === $user->id_unit;
                if ($step->approver_type === 'self_unit_head') return $user->isUnitHead() && $pencairan->rkatHeader->id_unit === $user->id_unit;
                if ($step->approver_type === 'parent_unit' && $pencairan->rkatHeader->unit) {
                    // Normal: prodi/sub-unit mengajukan, kepala unit-induk menyetujui
                    if ($user->isUnitHead() && $pencairan->rkatHeader->unit->parent_id === $user->id_unit) return true;
                    // Edge case: unit itu sendiri yang mengajukan (F. Vokasi submit sendiri)
                    if ($user->isUnitHead() && $pencairan->rkatHeader->unit->id_unit === $user->id_unit) return true;
                    return false;
                }
                
                return false;
            })->values();
        }
        
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
