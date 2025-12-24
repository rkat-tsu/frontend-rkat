<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Added Log Facade
use Inertia\Inertia;
use App\Models\RkatHeader; 
use App\Models\Unit; 
use Illuminate\Database\Eloquent\Builder;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        Log::debug('[Monitoring] User mengakses halaman monitoring.', [
            'user_id' => $user->id_user,
            'role' => $user->peran,
            'unit_id' => $user->id_unit
        ]);
        
        $query = RkatHeader::with(['unit', 'diajukanOleh']);

        // --- 1. Tentukan Scope Akses Berdasarkan Peran ---
        $globalAccessRoles = ['Admin', 'Rektor', 'WR_1', 'WR_2', 'WR_3'];
        
        if (in_array($user->peran, $globalAccessRoles)) {
            $accessScope = 'Global';
            Log::debug('[Monitoring] Akses Global diberikan.');
        } 
        else {
            $userUnit = $user->unit; 
            
            if (!$userUnit) {
                $query->whereRaw('1 = 0');
                $accessScope = 'No Unit Access';
                Log::warning('[Monitoring] User tidak memiliki unit. Akses diblokir.');
            } 
            else {
                $unitIds = [$userUnit->id_unit];
                $accessScope = 'Self Unit: ' . $userUnit->nama_unit;

                if (in_array($user->peran, ['Kaprodi', 'Kepala_Unit', 'Dekan'])) {
                    $childrenUnitIds = Unit::where('parent_id', $userUnit->id_unit)
                        ->pluck('id_unit')
                        ->toArray();

                    $unitIds = array_merge($unitIds, $childrenUnitIds);
                    
                    // Logic penamaan scope untuk debugging log
                    if ($user->peran === 'Dekan') {
                        $accessScope = 'Fakultas + Prodi';
                    } elseif ($user->peran === 'Kepala_Unit') {
                        $accessScope = 'Kepala Unit + Unit Bawahan';
                    } else {
                        $accessScope = 'Kaprodi + Unit Bawahan';
                    }
                }
                
                Log::debug('[Monitoring] Filter unit diterapkan.', [
                    'scope' => $accessScope,
                    'unit_ids_allowed' => $unitIds
                ]);

                $query->whereIn('id_unit', array_unique($unitIds));
            }
        }
        
        $rkatHeaders = $query
            ->orderBy('id_header', 'desc')
            ->paginate(15);
            
        Log::debug('[Monitoring] Data berhasil diambil.', [
            'count' => $rkatHeaders->count(),
            'total' => $rkatHeaders->total()
        ]);

        return Inertia::render('Monitoring/Index', [
            'rkatHeaders' => $rkatHeaders,
            'accessScope' => $accessScope, 
            'userRole' => $user->peran,
        ]);
    }
}