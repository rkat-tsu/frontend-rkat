<?php

namespace App\Http\Controllers;

use App\Models\PencairanDana;
use App\Models\RkatHeader;
use App\Models\TahunAnggaran;
use App\Models\Unit;
use App\Models\ApprovalPathStep;
use App\Models\RkatRabItem;
use App\Models\PencairanDanaItem;
use App\Http\Controllers\Concerns\PreservesPagination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PencairanDanaController extends Controller
{
    use PreservesPagination;

    public function index(Request $request)
    {
        $this->rememberPaginationQuery($request, 'pencairan');
        $user = Auth::user();

        $query = PencairanDana::with([
            'rkatHeader:id_header,uuid,nomor_dokumen,id_unit',
            'rkatHeader.unit:id_unit,nama_unit',
            'rkatHeader.rkatDetails:id_rkat_detail,id_header,jadwal_pelaksanaan_mulai,jadwal_pelaksanaan_akhir',
            'items:id_pencairan_item,id_pencairan,id_rkat_rab_item,volume_pencairan,volume_pencairan2,nominal_pencairan,sub_total_pencairan',
        ]);

        $effectiveRoles = $user->getEffectiveRoles();

        if ($user->peran !== 'Admin') {
            $query->where(function ($q) use ($user, $effectiveRoles) {
                // 1. Yang diajukan oleh unitnya sendiri
                $q->whereHas('rkatHeader', function ($hq) use ($user) {
                    $hq->where('id_unit', $user->id_unit);
                });

                // 2. Yang mana unitnya adalah parent_unit dari unit pengaju
                if ($user->canApproveUnit()) {
                    $q->orWhereHas('rkatHeader.unit', function ($uq) use ($user) {
                        $uq->where('parent_id', $user->id_unit)
                            ->whereHas('pencairanApprovalPath.steps', function ($stepQ) {
                                $stepQ->where('approver_type', 'parent_unit');
                            });
                    });
                }

                // 3. Yang mana unit/role-nya ada di dalam approval path
                $q->orWhereHas('rkatHeader.unit.pencairanApprovalPath.steps', function ($stepQ) use ($user, $effectiveRoles) {
                    $stepQ->where(function ($sq) use ($effectiveRoles) {
                        $sq->where('approver_type', 'role')
                            ->whereIn('role_name', $effectiveRoles);
                    });

                    if ($user->canApproveUnit()) {
                        $stepQ->orWhere(function ($sq) use ($user) {
                            $sq->where('approver_type', 'unit')
                                ->where('unit_id', $user->id_unit);
                        });
                    }
                });
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

        if ($request->filled('bulan')) {
            $query->whereMonth('pencairan_danas.tanggal_pengajuan', $request->bulan);
        }

        if ($request->filled('status')) {
            $query->where('pencairan_danas.status_pencairan', $request->status);
        }

        if ($request->filled('unit_id')) {
            $unit_id = $request->unit_id;
            $query->whereHas('rkatHeader', function ($q) use ($unit_id) {
                $q->where('id_unit', $unit_id);
            });
        }

        $perPage = request()->get('per_page', 15);
        $perPage = $perPage === 'all' ? 10000 : (int) $perPage;

        // SORTING
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        if ($sortBy === 'nomor_dokumen') {
            $query->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header')
                  ->orderBy('rkat_headers.nomor_dokumen', $sortDirection)
                  ->select('pencairan_danas.*');
        } elseif ($sortBy === 'unit') {
            $query->join('rkat_headers', 'pencairan_danas.id_header', '=', 'rkat_headers.id_header')
                  ->join('unit', 'rkat_headers.id_unit', '=', 'unit.id_unit')
                  ->orderBy('unit.nama_unit', $sortDirection)
                  ->select('pencairan_danas.*');
        } elseif (in_array($sortBy, ['status_pencairan', 'tanggal_pengajuan', 'created_at'])) {
            $query->orderBy("pencairan_danas.$sortBy", $sortDirection);
        } else {
            $query->orderBy('pencairan_danas.created_at', 'desc');
        }

        $pencairans = $query->paginate($perPage)->onEachSide(0)->withQueryString();
        $tahunAnggarans = TahunAnggaran::pluck('tahun_anggaran', null)->toArray();
        $units = Unit::select(['id_unit', 'nama_unit'])->get();

        $dynamicSteps = ApprovalPathStep::select('step_name')->distinct()->pluck('step_name')->toArray();
        $statuses = array_values(array_unique(array_merge(['Draft', 'Revisi', 'Disetujui_Final', 'Ditolak'], $dynamicSteps)));

        // --- Fetch RKAT List for Modal ---
        $rkatQuery = RkatHeader::with([
            'unit:id_unit,nama_unit',
            'rkatDetails:id_rkat_detail,id_header',
            'rkatDetails.rabItems' => function ($q) {
                $q->select([
                    'id',
                    'id_rkat_detail',
                    'deskripsi_item',
                    'volume',
                    'satuan',
                    'volume2',
                    'satuan2',
                    'harga_satuan',
                    'sub_total',
                ]);

                $notRejected = function ($itemsQuery) {
                    $itemsQuery->whereHas('pencairanDana', function ($pencairanQuery) {
                        $pencairanQuery->where('status_pencairan', '!=', 'Ditolak');
                    });
                };

                $q->withSum(['pencairanDanaItems as used_volume' => $notRejected], 'volume_pencairan')
                    ->withSum(['pencairanDanaItems as used_volume2' => $notRejected], 'volume_pencairan2')
                    ->withSum(['pencairanDanaItems as used_nominal' => $notRejected], 'sub_total_pencairan')
                    ->withExists([
                        'pencairanDanaItems as has_editable_pencairan' => function ($itemsQuery) {
                            $itemsQuery->whereHas('pencairanDana', function ($pencairanQuery) {
                                $pencairanQuery->whereIn('status_pencairan', ['Draft', 'Revisi']);
                            });
                        },
                    ]);
            },
        ])->where('status_persetujuan', 'Disetujui_Final');

        if ($user->peran !== 'Admin') {
            $rkatQuery->where('id_unit', $user->id_unit);
        }

        $rkatList = $rkatQuery->get()->map(function ($rkat) {
            $total_anggaran = 0;
            $total_tercairkan = 0;
            $items = [];
            foreach ($rkat->rkatDetails as $detail) {
                foreach ($detail->rabItems as $item) {
                    $usedVolume = (float) ($item->used_volume ?? 0);
                    $usedVolume2 = (float) ($item->used_volume2 ?? 0);
                    $usedNominal = (float) ($item->used_nominal ?? 0);
                    $total_anggaran += $item->sub_total;
                    $total_tercairkan += $usedNominal;
                    $hasEditablePencairan = (bool) $item->has_editable_pencairan;

                    if ((($item->sub_total > $usedNominal) && ((($item->volume - $usedVolume) > 0) || ($item->volume2 !== null && ($item->volume2 - $usedVolume2) > 0))) || $hasEditablePencairan) {
                        $items[] = [
                            'id' => $item->id,
                            'deskripsi_item' => $item->deskripsi_item,
                            'harga_satuan' => $item->harga_satuan,
                            'volume' => $item->volume,
                            'remaining_volume2' => $item->volume2 === null ? 0 : max(0, $item->volume2 - $usedVolume2),
                            'can_disburse_volume2' => $item->volume2 !== null,
                            'satuan' => $item->satuan,
                            'volume2' => $item->volume2,
                            'satuan2' => $item->satuan2,
                            'sub_total' => $item->sub_total,
                            'used_volume' => $usedVolume,
                            'used_nominal' => $usedNominal,
                            'remaining_volume' => $item->volume - $usedVolume,
                            'remaining_nominal' => max(0, $item->sub_total - $usedNominal),
                            'has_editable_pencairan' => $hasEditablePencairan,
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
        })->filter(function ($rkat) {
            return count($rkat['rab_items']) > 0;
        })->values();

        return Inertia::render('Pencairan/Index', [
            'pencairans' => $pencairans,
            'filters' => $request->only(['search', 'tahun', 'bulan', 'status', 'unit_id', 'per_page', 'sort_by', 'sort_direction']),
            'tahunAnggarans' => $tahunAnggarans,
            'units' => $units,
            'statuses' => $statuses,
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
            'items.*.volume_pencairan' => 'required|numeric|min:0',
            'items.*.volume_pencairan2' => 'required|numeric|min:0',
            'items.*.nominal_pencairan' => 'required|numeric|min:0',
        ]);

        $rkat = RkatHeader::findOrFail($request->id_header);

        if ($user->peran !== 'Admin' && $rkat->id_unit !== $user->id_unit) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengajukan pencairan untuk unit ini.');
        }

        $rabItems = $this->loadRabItemsForDisbursement(
            collect($request->items)->pluck('id')->all(),
            $rkat->id_header
        );

        // Validate items remaining budget using one aggregated query for all items.
        foreach ($request->items as $reqItem) {
            $rabItem = $rabItems->get($reqItem['id']);
            abort_if(!$rabItem, 404);
            $usedVolume = (float) ($rabItem->used_volume ?? 0);
            $usedVolume2 = (float) ($rabItem->used_volume2 ?? 0);
            $usedSubTotal = (float) ($rabItem->used_sub_total ?? 0);

            $remainingVolume = $rabItem->volume - $usedVolume;
            $remainingSubTotal = $rabItem->sub_total - $usedSubTotal;
            $volume1 = (float) $reqItem['volume_pencairan'];
            $volume2 = (float) $reqItem['volume_pencairan2'];
            if (($volume1 > 0) === ($volume2 > 0)) {
                return redirect()->back()->with('error', 'Isi volume 1 atau volume 2 saja untuk setiap item pencairan.');
            }
            $reqSubTotal = ($volume1 > 0 ? $volume1 : $volume2) * $reqItem['nominal_pencairan'];

            if ($reqItem['volume_pencairan'] > $remainingVolume) {
                return redirect()->back()->with('error', 'Volume pencairan untuk "' . $rabItem->deskripsi_item . '" melebihi sisa volume (Sisa: ' . $remainingVolume . ').');
            }
            if ($volume2 > 0 && ($rabItem->volume2 === null || $volume2 > ($rabItem->volume2 - $usedVolume2))) {
                return redirect()->back()->with('error', 'Volume kedua pencairan untuk "' . $rabItem->deskripsi_item . '" melebihi sisa volume.');
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
            $subTotal = ((float) $reqItem['volume_pencairan'] > 0
                ? $reqItem['volume_pencairan']
                : $reqItem['volume_pencairan2']) * $reqItem['nominal_pencairan'];
            PencairanDanaItem::create([
                'id_pencairan' => $pencairan->id_pencairan,
                'id_rkat_rab_item' => $reqItem['id'],
                'volume_pencairan' => $reqItem['volume_pencairan'],
                'volume_pencairan2' => $reqItem['volume_pencairan2'],
                'nominal_pencairan' => $reqItem['nominal_pencairan'],
                'sub_total_pencairan' => $subTotal,
            ]);
        }

        return $this->redirectToPaginatedList($request, 'pencairan', 'pencairan.index')->with('success', 'Pencairan Dana berhasil dibuat sebagai Draft.');
    }

    public function update(Request $request, PencairanDana $pencairan)
    {
        $user = Auth::user();

        if ($pencairan->status_pencairan !== 'Draft' && $pencairan->status_pencairan !== 'Revisi') {
            return redirect()->back()->with('error', 'Hanya dokumen Draft atau Revisi yang dapat diedit.');
        }

        $unitPencairan = $pencairan->rkatHeader?->id_unit;
        if ($user->peran !== 'Admin' && $pencairan->diajukan_oleh !== $user->id_user && $user->id_unit !== $unitPencairan) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengedit pencairan ini.');
        }

        $request->validate([
            'id_header' => 'required|exists:rkat_headers,id_header',
            'nama_pencairan' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:rkat_rab_items,id',
            'items.*.volume_pencairan' => 'required|numeric|min:0',
            'items.*.volume_pencairan2' => 'required|numeric|min:0',
            'items.*.nominal_pencairan' => 'required|numeric|min:0',
        ]);

        $rkat = RkatHeader::findOrFail($request->id_header);

        if ($user->peran !== 'Admin' && $rkat->id_unit !== $user->id_unit) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengajukan pencairan untuk unit ini.');
        }

        $rabItems = $this->loadRabItemsForDisbursement(
            collect($request->items)->pluck('id')->all(),
            $rkat->id_header,
            $pencairan->id_pencairan
        );

        // Validate items remaining budget using one aggregated query for all items.
        foreach ($request->items as $reqItem) {
            $rabItem = $rabItems->get($reqItem['id']);
            abort_if(!$rabItem, 404);
            $usedVolume = (float) ($rabItem->used_volume ?? 0);
            $usedVolume2 = (float) ($rabItem->used_volume2 ?? 0);
            $usedSubTotal = (float) ($rabItem->used_sub_total ?? 0);

            $remainingVolume = $rabItem->volume - $usedVolume;
            $remainingSubTotal = $rabItem->sub_total - $usedSubTotal;
            $volume1 = (float) $reqItem['volume_pencairan'];
            $volume2 = (float) $reqItem['volume_pencairan2'];
            if (($volume1 > 0) === ($volume2 > 0)) {
                return redirect()->back()->with('error', 'Isi volume 1 atau volume 2 saja untuk setiap item pencairan.');
            }
            $reqSubTotal = ($volume1 > 0 ? $volume1 : $volume2) * $reqItem['nominal_pencairan'];

            if ($reqItem['volume_pencairan'] > $remainingVolume) {
                return redirect()->back()->with('error', 'Volume pencairan untuk "' . $rabItem->deskripsi_item . '" melebihi sisa volume (Sisa: ' . $remainingVolume . ').');
            }
            if ($volume2 > 0 && ($rabItem->volume2 === null || $volume2 > ($rabItem->volume2 - $usedVolume2))) {
                return redirect()->back()->with('error', 'Volume kedua pencairan untuk "' . $rabItem->deskripsi_item . '" melebihi sisa volume.');
            }
            if ($reqSubTotal > $remainingSubTotal) {
                return redirect()->back()->with('error', 'Sub total pencairan untuk "' . $rabItem->deskripsi_item . '" melebihi sisa anggaran.');
            }
        }

        $pencairan->fill([
            'id_header' => $request->id_header,
            'nama_pencairan' => $request->nama_pencairan,
        ])->save();

        // Remove old items
        $pencairan->items()->delete();

        // Add new items
        foreach ($request->items as $reqItem) {
            $subTotal = ((float) $reqItem['volume_pencairan'] > 0
                ? $reqItem['volume_pencairan']
                : $reqItem['volume_pencairan2']) * $reqItem['nominal_pencairan'];
            PencairanDanaItem::create([
                'id_pencairan' => $pencairan->id_pencairan,
                'id_rkat_rab_item' => $reqItem['id'],
                'volume_pencairan' => $reqItem['volume_pencairan'],
                'volume_pencairan2' => $reqItem['volume_pencairan2'],
                'nominal_pencairan' => $reqItem['nominal_pencairan'],
                'sub_total_pencairan' => $subTotal,
            ]);
        }

        return $this->redirectToPaginatedList($request, 'pencairan', 'pencairan.index')->with('success', 'Pencairan Dana berhasil diperbarui.');
    }

    /**
     * Ambil item RAB beserta total volume dan nominal yang sudah diajukan.
     * Satu query ini menggantikan pencarian dan tiga SUM berulang per item.
     */
    private function loadRabItemsForDisbursement(array $itemIds, int $headerId, ?int $excludePencairanId = null)
    {
        $eligibleItems = function ($query) use ($excludePencairanId) {
            $query->whereHas('pencairanDana', function ($pencairanQuery) use ($excludePencairanId) {
                $pencairanQuery->where('status_pencairan', '!=', 'Ditolak');
                if ($excludePencairanId !== null) {
                    $pencairanQuery->where('id_pencairan', '!=', $excludePencairanId);
                }
            });
        };

        return RkatRabItem::query()
            ->whereIn('id', $itemIds)
            ->whereHas('rkatDetail', fn($query) => $query->where('id_header', $headerId))
            ->withSum(['pencairanDanaItems as used_volume' => $eligibleItems], 'volume_pencairan')
            ->withSum(['pencairanDanaItems as used_volume2' => $eligibleItems], 'volume_pencairan2')
            ->withSum(['pencairanDanaItems as used_sub_total' => $eligibleItems], 'sub_total_pencairan')
            ->get()
            ->keyBy('id');
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

            $hasAccess = $isParentUnit || ($user->peran !== 'Rektorat' && $user->isApprover());

            // Check if user is in any step of the dynamic approval path
            if (!$hasAccess && $pencairan->rkatHeader->unit && $pencairan->rkatHeader->unit->pencairanApprovalPath) {
                $steps = $pencairan->rkatHeader->unit->pencairanApprovalPath->steps;
                $effectiveRoles = $user->getEffectiveRoles();
                foreach ($steps as $step) {
                    if ($step->approver_type === 'role' && in_array($step->role_name, $effectiveRoles)) $hasAccess = true;
                    if ($step->approver_type === 'unit' && $user->canApproveUnit() && (int) $step->unit_id === (int) $user->id_unit) $hasAccess = true;
                    if ($step->approver_type === 'self_unit_head' && $user->isUnitHead() && $pencairan->rkatHeader->id_unit === $user->id_unit) $hasAccess = true;
                    if ($step->approver_type === 'parent_unit' && $user->isUnitHead() && ($pencairan->rkatHeader->unit->parent_id === $user->id_unit || $pencairan->rkatHeader->unit->id_unit === $user->id_unit)) $hasAccess = true;
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

    public function submit(Request $request, PencairanDana $pencairan)
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

        return $this->redirectToPaginatedList($request, 'pencairan', 'pencairan.index')->with('success', 'Pencairan Dana berhasil diajukan.');
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
        $isAdminOrRektor = $user->isAdmin();
        $effectiveRoles = $user->getEffectiveRoles();

        if (!$isAdminOrRektor) {
            $hasAccess = false;
            if ($currentStep) {
                if ($currentStep->approver_type === 'role' && in_array($currentStep->role_name, $effectiveRoles)) $hasAccess = true;
                if ($currentStep->approver_type === 'unit' && $user->canApproveUnit() && (int) $currentStep->unit_id === (int) $user->id_unit) $hasAccess = true;
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
    public function approvalIndex(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $peran = $user->peran;
        $effectiveRoles = $user->getEffectiveRoles();

        if (! $user->isApprover() && ! $user->isAdmin()) {
            abort(403, 'Anda tidak memiliki hak akses untuk halaman ini.');
        }

        $user->loadMissing('unit.children');

        $query = PencairanDana::with([
            'rkatHeader.unit',
            'rkatHeader.rkatDetails',
            'pengaju',
            'currentStep'
        ]);

        if ($user->isAdmin()) {
            $query->whereNotNull('current_step_id');
        } else {
            $query->whereNotNull('current_step_id');
            $query->where(function ($q) use ($user, $peran, $effectiveRoles) {
                $q->orWhereHas('currentStep', function ($stepQ) use ($effectiveRoles) {
                    $stepQ->where('approver_type', 'role')
                        ->whereIn('role_name', $effectiveRoles);
                });

                if ($user->canApproveUnit()) {
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
        if (!$user->isAdmin()) {
            $pencairans = $pencairans->filter(function ($pencairan) use ($user, $peran, $effectiveRoles) {
                $step = $pencairan->currentStep;
                if (!$step) return false;

                if ($step->approver_type === 'role') return in_array($step->role_name, $effectiveRoles);
                if ($step->approver_type === 'unit') return $user->canApproveUnit() && (int) $step->unit_id === (int) $user->id_unit;
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
        $sortBy = $request->input('sort_by', 'updated_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        if ($sortBy === 'nomor_dokumen') {
            $pencairans = $sortDirection === 'asc'
                ? $pencairans->sortBy(fn($p) => $p->rkatHeader->nomor_dokumen ?? '')
                : $pencairans->sortByDesc(fn($p) => $p->rkatHeader->nomor_dokumen ?? '');
        } elseif ($sortBy === 'unit') {
            $pencairans = $sortDirection === 'asc'
                ? $pencairans->sortBy(fn($p) => $p->rkatHeader->unit->nama_unit ?? '')
                : $pencairans->sortByDesc(fn($p) => $p->rkatHeader->unit->nama_unit ?? '');
        } else {
            $pencairans = $sortDirection === 'asc'
                ? $pencairans->sortBy($sortBy)
                : $pencairans->sortByDesc($sortBy);
        }

        $pencairans = $pencairans->values();

        return Inertia::render('Pencairan/Approval', [
            'pencairans' => $pencairans,
            'filters' => $request->only(['sort_by', 'sort_direction'])
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
