<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\RkatHeader;
use App\Models\PencairanDana;
use App\Models\Lpj;
use App\Models\ApprovalPath;
use Illuminate\Support\Facades\DB;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $canApprovePencairan = false;
        
        if ($user) {
            $user->loadMissing('unit');
            $canApprovePencairan = $user->peran === 'Admin' || 
                ($user->peran === 'Rektorat' && $user->unit?->nama_unit === 'WR-2') ||
                ($user->unit && $user->isUnitHead() && (
                    stripos($user->unit->nama_unit, 'BAAK') !== false ||
                    stripos($user->unit->nama_unit, 'BAUK') !== false ||
                    $user->unit->children()->exists()
                ));
        }

        $documentNotifications = [];
        $approvalNotifications = [];
        $approvalNotificationCount = 0;
        $notificationLimit = $request->routeIs('notifications.index') ? null : 10;
        if ($user) {
            $user->loadMissing('unit');
            $effectiveRoles = $user->getEffectiveRoles();
            $canApproveStep = function ($step, $unit = null) use ($user, $effectiveRoles) {
                if ($user->isAdmin()) return true;
                if (!$step) return false;
                return match ($step->approver_type) {
                    'role' => in_array($step->role_name, $effectiveRoles, true),
                    'unit' => $user->canApproveUnit() && (int) $step->unit_id === (int) $user->id_unit,
                    'self_unit_head' => $user->isUnitHead() && (int) $unit?->id_unit === (int) $user->id_unit,
                    'parent_unit' => $user->isUnitHead() && (int) $unit?->parent_id === (int) $user->id_unit,
                    default => false,
                };
            };

            if ($user->isAdmin() || $user->isApprover()) {
                $rkatQuery = RkatHeader::query()->whereNotNull('current_step_id');
                if ($user->isAdmin()) {
                    $rkatApprovalCount = (clone $rkatQuery)->count();
                    $rkatApprovalItems = $rkatQuery->with(['currentStep', 'unit'])
                        ->latest('updated_at')
                        ->when($notificationLimit !== null, fn ($query) => $query->limit($notificationLimit))
                        ->get();
                } else {
                    $rkatApprovalItems = $rkatQuery->with(['currentStep', 'unit'])->latest('updated_at')->get()
                        ->filter(fn ($doc) => $canApproveStep($doc->currentStep, $doc->unit));
                    $rkatApprovalCount = $rkatApprovalItems->count();
                }
                $approvalNotificationCount += $rkatApprovalCount;
                $rkatApprovals = $rkatApprovalItems
                    ->when($notificationLimit !== null, fn ($items) => $items->take($notificationLimit))
                    ->map(fn ($doc) => [
                        'id' => 'approval-rkat-' . $doc->id_header,
                        'title' => $doc->nomor_dokumen ?: 'Dokumen RKAT', 'type' => 'RKAT',
                        'status' => $doc->status_persetujuan, 'progress' => $doc->currentStep?->step_name,
                        'date' => $doc->updated_at?->toIso8601String(), 'url' => route('daftar-ajuan.show', $doc->uuid),
                    ]);

                $pencairanQuery = PencairanDana::query()->whereNotNull('current_step_id');
                if ($user->isAdmin()) {
                    $pencairanApprovalCount = (clone $pencairanQuery)->count();
                    $pencairanApprovalItems = $pencairanQuery->with(['currentStep', 'rkatHeader.unit'])
                        ->latest('updated_at')
                        ->when($notificationLimit !== null, fn ($query) => $query->limit($notificationLimit))
                        ->get();
                } else {
                    $pencairanApprovalItems = $pencairanQuery->with(['currentStep', 'rkatHeader.unit'])->latest('updated_at')->get()
                        ->filter(fn ($doc) => $canApproveStep($doc->currentStep, $doc->rkatHeader?->unit));
                    $pencairanApprovalCount = $pencairanApprovalItems->count();
                }
                $approvalNotificationCount += $pencairanApprovalCount;
                $pencairanApprovals = $pencairanApprovalItems
                    ->when($notificationLimit !== null, fn ($items) => $items->take($notificationLimit))
                    ->map(fn ($doc) => [
                        'id' => 'approval-pencairan-' . $doc->id_pencairan,
                        'title' => $doc->nama_pencairan ?: 'Pengajuan Pencairan Dana', 'type' => 'Pencairan Dana',
                        'status' => $doc->status_pencairan, 'progress' => $doc->currentStep?->step_name,
                        'date' => $doc->updated_at?->toIso8601String(), 'url' => route('pencairan.show', $doc->uuid),
                    ]);

                $lpjQuery = Lpj::query()->where('status_lpj', 'Diajukan');
                if ($user->isAdmin()) {
                    $lpjApprovalCount = (clone $lpjQuery)->count();
                    $lpjApprovalItems = $lpjQuery->latest('updated_at')
                        ->when($notificationLimit !== null, fn ($query) => $query->limit($notificationLimit))
                        ->get();
                } else {
                    $lpjPathId = DB::table('approval_path_settings')->where('key', 'lpj')->value('approval_path_id');
                    $lpjPath = $lpjPathId ? ApprovalPath::with('steps')->find($lpjPathId) : null;
                    $lpjApprovalItems = $lpjQuery->with(['rkatHeader.unit', 'pencairanDana.rkatHeader.unit'])->latest('updated_at')->get()
                        ->filter(function ($doc) use ($lpjPath, $canApproveStep) {
                            $step = $lpjPath?->steps->firstWhere('order', $doc->current_approval_step)
                                ?? ($doc->current_approval_step ? null : $lpjPath?->steps->sortBy('order')->first());
                            $unit = $doc->rkatHeader?->unit ?? $doc->pencairanDana?->rkatHeader?->unit;
                            return $canApproveStep($step, $unit);
                        });
                    $lpjApprovalCount = $lpjApprovalItems->count();
                }
                $approvalNotificationCount += $lpjApprovalCount;
                $lpjApprovals = $lpjApprovalItems
                    ->when($notificationLimit !== null, fn ($items) => $items->take($notificationLimit))
                    ->map(fn ($doc) => [
                        'id' => 'approval-lpj-' . $doc->id_lpj,
                        'title' => $doc->nomor_lpj ?: $doc->judul_lpj ?: 'Laporan Pertanggungjawaban', 'type' => 'LPJ',
                        'status' => $doc->status_lpj, 'progress' => 'Menunggu persetujuan',
                        'date' => $doc->updated_at?->toIso8601String(), 'url' => route('lpj.index'),
                    ]);

                $approvalNotifications = $rkatApprovals->concat($pencairanApprovals)->concat($lpjApprovals)
                    ->sortByDesc('date')
                    ->when($notificationLimit !== null, fn ($items) => $items->take($notificationLimit))
                    ->values();
            }

            $documentNotifications = collect()
                ->concat(RkatHeader::query()
                    ->where('diajukan_oleh', $user->id_user)
                    ->where('status_persetujuan', '!=', 'Draft')
                    ->whereNotNull('tanggal_pengajuan')
                    ->with('currentStep:id,step_name')
                    ->latest('tanggal_pengajuan')->when($notificationLimit !== null, fn ($query) => $query->limit($notificationLimit))->get()
                    ->map(fn ($document) => [
                        'id' => 'rkat-' . $document->id_header,
                        'title' => $document->nomor_dokumen ?: 'Dokumen RKAT',
                        'type' => 'RKAT',
                        'status' => $document->status_persetujuan,
                        'progress' => $document->currentStep?->step_name,
                        'date' => $document->tanggal_pengajuan?->toIso8601String(),
                        'url' => route('daftar-ajuan.show', $document->uuid),
                    ]))
                ->concat(PencairanDana::query()
                    ->where('diajukan_oleh', $user->id_user)
                    ->where('status_pencairan', '!=', 'Draft')
                    ->whereNotNull('tanggal_pengajuan')
                    ->with('currentStep:id,step_name')
                    ->latest('tanggal_pengajuan')->when($notificationLimit !== null, fn ($query) => $query->limit($notificationLimit))->get()
                    ->map(fn ($document) => [
                        'id' => 'pencairan-' . $document->id_pencairan,
                        'title' => $document->nama_pencairan ?: 'Pengajuan Pencairan Dana',
                        'type' => 'Pencairan Dana',
                        'status' => $document->status_pencairan,
                        'progress' => $document->currentStep?->step_name,
                        'date' => $document->tanggal_pengajuan?->toIso8601String(),
                        'url' => route('pencairan.show', $document->uuid),
                    ]))
                ->concat(Lpj::query()
                    ->where('diajukan_oleh', $user->id_user)
                    ->where('status_lpj', '!=', 'Draft')
                    ->whereNotNull('tanggal_pengajuan')
                    ->latest('tanggal_pengajuan')->when($notificationLimit !== null, fn ($query) => $query->limit($notificationLimit))->get()
                    ->map(fn ($document) => [
                        'id' => 'lpj-' . $document->id_lpj,
                        'title' => $document->nomor_lpj ?: $document->judul_lpj ?: 'Laporan Pertanggungjawaban',
                        'type' => 'LPJ',
                        'status' => $document->status_lpj,
                        'progress' => null,
                        'date' => $document->tanggal_pengajuan?->toIso8601String(),
                        'url' => route('lpj.index'),
                    ]))
                ->sortByDesc('date')
                ->when($notificationLimit !== null, fn ($items) => $items->take($notificationLimit))
                ->values();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'can_approve_pencairan' => $canApprovePencairan
                ]) : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'documentNotifications' => $documentNotifications,
            'approvalNotifications' => $approvalNotifications,
            'approvalNotificationCount' => $approvalNotificationCount,
        ];
    }
}
