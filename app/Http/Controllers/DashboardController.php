<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Added Log Facade
use Inertia\Inertia;
use App\Models\RkatHeader;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        Log::debug('[Dashboard] Memuat dashboard untuk user: ' . $user->username . ' (' . $user->peran . ')');
        
        $superAdminRoles = ['Admin', 'Rektor', 'WR_1', 'WR_2', 'WR_3'];

        $baseQuery = RkatHeader::query();

        if (!in_array($user->peran, $superAdminRoles)) {
            $baseQuery->where('id_unit', $user->id_unit);
            Log::debug('[Dashboard] Filter unit applied: ' . $user->id_unit);
        }

        $pendingStatuses = [
            'Draft',
            'Diajukan', 'Revisi', 'Disetujui_L1', 
            'Menunggu_Dekan_Kepala', 'Menunggu_WR1', 'Menunggu_WR3', 'Menunggu_WR2'
        ];
        $approvedStatuses = ['Disetujui_WR1', 'Disetujui_WR2', 'Disetujui_WR3', 'Disetujui_Final'];
        $rejectedStatuses = ['Ditolak'];

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->whereIn('status_persetujuan', $pendingStatuses)->count(),
            'approved' => (clone $baseQuery)->whereIn('status_persetujuan', $approvedStatuses)->count(),
            'rejected' => (clone $baseQuery)->whereIn('status_persetujuan', $rejectedStatuses)->count(),
        ];
        
        Log::debug('[Dashboard] Stats calculated.', $stats);

        $recentRkats = (clone $baseQuery)
            ->with('unit') 
            ->latest('updated_at') 
            ->take(5) 
            ->get();

        $rkatTerbaru = $recentRkats->map(function ($rkat) {
            return [
                'unit' => $rkat->unit->nama_unit ?? 'N/A',
                'judul' => "Pengajuan RKAT dari " . ($rkat->unit->nama_unit ?? 'Unit tidak diketahui'), 
                'waktu' => $rkat->updated_at->diffForHumans(), 
                'status' => $this->mapStatusToFrontend($rkat->status_persetujuan), 
            ];
        });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'rkatTerbaru' => $rkatTerbaru,
        ]);
    }

    private function mapStatusToFrontend($dbStatus)
    {
        switch ($dbStatus) {
            case 'Diajukan':
            case 'Menunggu_Dekan_Kepala':
            case 'Menunggu_WR1':
            case 'Menunggu_WR2':
            case 'Menunggu_WR3':
                return 'Menunggu Persetujuan';

            case 'Disetujui_L1':
            case 'Disetujui_WR1':
            case 'Disetujui_WR2':
            case 'Disetujui_WR3':
            case 'Disetujui_Final':
                return 'Approve'; 

            case 'Ditolak':
                return 'Ditolak';

            case 'Draft':
            case 'Revisi':
            default:
                return 'Pending'; 
        }
    }
}