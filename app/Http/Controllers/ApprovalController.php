<?php

namespace App\Http\Controllers;

use App\Models\LogPersetujuan;
use App\Models\RkatHeader;
use App\Models\TahunAnggaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $peran = $user->peran;
        
        Log::debug('[Approval] Akses Index oleh: ' . $user->username . ' Peran: ' . $peran);

        if (! $user->isApprover() && ! $user->isAdmin()) {
            Log::warning('[Approval] Akses Ditolak untuk: ' . $user->username);
            abort(403, 'Anda tidak memiliki hak akses untuk halaman ini.');
        }

        $user->loadMissing('unit.children');

        $activeTahun = TahunAnggaran::query()->where('status_rkat', 'Approved')->exists();
        if (!$activeTahun && !$user->isAdmin()) {
             return Inertia::render('Approval/Index', [
                'rkatMenunggu' => [],
                'currentRole'  => $peran,
                'message'      => 'Tahap review belum dibuka atau sudah ditutup.'
            ]);
        }

        $query = RkatHeader::with([
            'unit:id_unit,nama_unit,approval_path_id,parent_id',
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
                        })->where('id_unit', $user->id_unit);
                    });

                    $q->orWhere(function ($parentQ) use ($user) {
                        $parentQ->whereHas('currentStep', function ($stepQ) {
                            $stepQ->where('approver_type', 'parent_unit');
                        })->whereHas('unit', function ($unitQ) use ($user) {
                            $unitQ->where('parent_id', $user->id_unit);
                        });
                    });
                }
            });
        }

        $rkatList = $query->latest('updated_at')->get();
        
        // Filter di memory untuk keamanan ganda jika relasi query kurang presisi
        if (!in_array($peran, ['Admin', 'Rektor'])) {
            $rkatList = $rkatList->filter(function ($rkat) use ($user, $peran) {
                $step = $rkat->currentStep;
                if (!$step) return false;
                
                if ($step->approver_type === 'role') return $step->role_name === $peran;
                if ($step->approver_type === 'unit') return $user->isUnitHead() && $step->unit_id === $user->id_unit;
                if ($step->approver_type === 'self_unit_head') return $user->isUnitHead() && $rkat->id_unit === $user->id_unit;
                if ($step->approver_type === 'parent_unit') return $user->isUnitHead() && $rkat->unit && $rkat->unit->parent_id === $user->id_unit;
                
                return false;
            })->values();
        }

        Log::debug('[Approval] Memuat ' . $rkatList->count() . ' item untuk persetujuan.');

        return Inertia::render('Approval/Index', [
            'rkatMenunggu' => $rkatList,
            'currentRole'  => $peran,
        ]);
    }

    public function approve(Request $request, RkatHeader $rkatHeader): RedirectResponse
    {
        $user = $request->user();
        Log::info('[Approval] Permintaan Aksi', [
            'user'    => $user->username,
            'rkat_id' => $rkatHeader->id_header,
            'action'  => $request->aksi
        ]);

        $request->validate([
            'aksi'    => ['required', 'string', Rule::in(['Setuju', 'Revisi', 'Tolak'])],
            'catatan' => [
                Rule::requiredIf(fn () => $request->aksi === 'Revisi' || $request->aksi === 'Tolak'),
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $rkatHeader->load('tahun_obj', 'currentStep', 'unit.approvalPath.steps');
        if ($rkatHeader->tahun_obj->status_rkat !== 'Approved' && !$user->isAdmin()) {
            return Redirect::back()->withErrors([
                'error' => 'Persetujuan hanya dapat dilakukan pada tahap Approved (Review).',
            ]);
        }

        $currentStep = $rkatHeader->currentStep;
        $isAdminOrRektor = in_array($user->peran, ['Admin', 'Rektor']);

        if (!$isAdminOrRektor) {
            $hasAccess = false;
            if ($currentStep) {
                if ($currentStep->approver_type === 'role' && $currentStep->role_name === $user->peran) $hasAccess = true;
                if ($currentStep->approver_type === 'unit' && $user->isUnitHead() && $currentStep->unit_id === $user->id_unit) $hasAccess = true;
                if ($currentStep->approver_type === 'self_unit_head' && $user->isUnitHead() && $rkatHeader->id_unit === $user->id_unit) $hasAccess = true;
                if ($currentStep->approver_type === 'parent_unit' && $user->isUnitHead() && $rkatHeader->unit && $rkatHeader->unit->parent_id === $user->id_unit) $hasAccess = true;
            }

            if (!$hasAccess) {
                Log::error('[Approval] Ketidakcocokan Status/Hak Akses', ['step_sekarang' => $currentStep ? $currentStep->step_name : 'null']);
                return Redirect::back()->withErrors([
                    'error' => 'RKAT ini tidak berada pada tahap persetujuan Anda atau Anda tidak memiliki akses.',
                ]);
            }
        }
        
        $aksi = $request->aksi;

        try {
            DB::transaction(function () use ($rkatHeader, $user, $aksi, $request, $currentStep) {
                $oldStatus = $rkatHeader->status_persetujuan;
                $updateData = [];

                if ($aksi === 'Setuju') {
                    // Simpan tanggal persetujuan ke kolom JSON
                    if ($currentStep) {
                        $approvalDates = $rkatHeader->approval_dates ?? [];
                        $approvalDates[$currentStep->step_name] = now()->toDateTimeString();
                        $updateData['approval_dates'] = $approvalDates;
                    }

                    // Cari step berikutnya
                    $nextStep = null;
                    if ($currentStep && $rkatHeader->unit && $rkatHeader->unit->approvalPath) {
                        $nextStep = $rkatHeader->unit->approvalPath->steps
                            ->where('order', '>', $currentStep->order)
                            ->sortBy('order')
                            ->first();
                    }

                    if ($nextStep) {
                        $updateData['status_persetujuan'] = $nextStep->step_name;
                        $updateData['current_step_id'] = $nextStep->id;
                    } else {
                        // Jika tidak ada step berikutnya, maka selesai
                        $updateData['status_persetujuan'] = 'Disetujui_Final';
                        $updateData['current_step_id'] = null; // Selesai
                    }

                } elseif ($aksi === 'Revisi') {
                    $updateData['status_persetujuan'] = 'Revisi';
                    $updateData['current_step_id'] = null;
                } elseif ($aksi === 'Tolak') {
                    $updateData['status_persetujuan'] = 'Ditolak';
                    $updateData['current_step_id'] = null;
                }

                RkatHeader::query()->where('id_header', $rkatHeader->id_header)->update($updateData);
                
                $newStatus = $updateData['status_persetujuan'];
                Log::info("[Approval] Status Berubah: $oldStatus -> $newStatus");

                LogPersetujuan::create([
                    'id_header'         => $rkatHeader->id_header,
                    'id_approver'       => $user->id_user,
                    'level_persetujuan' => $currentStep ? $currentStep->step_name : $user->peran, 
                    'aksi'              => $aksi,
                    'catatan'           => $request->catatan,
                ]);
            });

            return Redirect::route('approval.index')->with('success', "RKAT #{$rkatHeader->id_header} berhasil di{$aksi}.");
        } catch (\Exception $e) {
            Log::error('[Approval] Gagal memproses aksi: ' . $e->getMessage());
            return Redirect::back()->withErrors([
                'error' => 'Gagal memproses persetujuan: ' . $e->getMessage(),
            ])->with('error', 'Gagal memproses persetujuan: ' . $e->getMessage());
        }
    }
}