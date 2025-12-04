<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\RkatHeader; 
use App\Models\Unit; // Digunakan untuk mencari unit anak
use App\Http\Resources\RkatHeaderResource; // Asumsikan Anda memiliki Resource ini
use Illuminate\Database\Eloquent\Builder;

class MonitoringController extends Controller
{
    /**
     * Menampilkan halaman monitoring RKAT, dengan data yang difilter 
     * berdasarkan peran dan hirarki unit pengguna.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Query dasar untuk RKAT Header
        $query = RkatHeader::with(['unit', 'diajukanOleh']);

        // --- 1. Tentukan Scope Akses Berdasarkan Peran ---
        
        // Peran Super Global Access (Melihat SEMUA RKAT)
        $globalAccessRoles = ['Admin', 'Rektor', 'WR_1', 'WR_2', 'WR_3'];
        
        if (in_array($user->peran, $globalAccessRoles)) {
            // TIDAK ada filter tambahan pada query.
            $accessScope = 'Global';
        } 
        else {
            // Peran Terbatas (Inputer, Kaprodi, Dekan, Kepala Unit)
            
            // Dapatkan unit pengguna yang login
            $userUnit = $user->unit; 
            
            if (!$userUnit) {
                // Jika user tidak terhubung ke unit, kembalikan data kosong.
                $query->whereRaw('1 = 0'); // Query yang selalu false
                $accessScope = 'No Unit Access';
            } 
            else {
                // Logika utama: Pengguna hanya melihat RKAT dari unit yang mereka kelola atau miliki.
                
                // Mulai dengan hanya melihat RKAT dari unit pengguna sendiri
                $unitIds = [$userUnit->id_unit];
                $accessScope = 'Self Unit: ' . $userUnit->nama_unit;

                // Tambahkan ID unit anak/bawahan ke array
                if (in_array($user->peran, ['Kaprodi', 'Kepala_Unit', 'Dekan'])) {
                    
                    // Kaprodi/Kepala Unit/Dekan mengawasi unit di bawah mereka.
                    // Cari semua unit anak langsung (Prodi di bawah Fakultas, atau unit bawahan di bawah unit non-akademik).
                    // Asumsi: Kaprodi/Kepala Unit/Dekan memimpin unit parent/induk bagi unit-unit anak.
                    
                    // Kita mencari Unit yang parent_id-nya adalah ID Unit pengguna.
                    $childrenUnitIds = Unit::where('parent_id', $userUnit->id_unit)
                        ->pluck('id_unit')
                        ->toArray();

                    $unitIds = array_merge($unitIds, $childrenUnitIds);
                    
                    if ($user->peran === 'Dekan') {
                        $accessScope = 'Fakultas + Prodi';
                    } elseif ($user->peran === 'Kepala_Unit') {
                        $accessScope = 'Kepala Unit + Unit Bawahan';
                    } else {
                        $accessScope = 'Kaprodi + Unit Bawahan';
                    }
                }
                
                // Terapkan filter scope unit
                $query->whereIn('id_unit', array_unique($unitIds));
            }
        }
        
        // --- 2. Filter dan Search Tambahan (Opsional) ---
        
        // Tambahkan filter dan search dari request jika diperlukan (seperti di UnitController)
        // Contoh: if ($request->has('status')) { $query->where('status_persetujuan', $request->status); }

        // --- 3. Eksekusi Query dan Kirim ke Inertia ---
        
        $rkatHeaders = $query
            ->orderBy('id_header', 'desc')
            ->paginate(15);
            
        // Catatan: Gunakan RkatHeaderResource::collection($rkatHeaders) jika Anda sudah membuat Resource-nya.
        // Jika belum, gunakan $rkatHeaders langsung dan biarkan formatting di React.

        return Inertia::render('Monitoring/Index', [
            'rkatHeaders' => $rkatHeaders, // Ganti dengan Resource jika sudah ada
            'accessScope' => $accessScope, // Tambahkan ini untuk debugging di frontend
            'userRole' => $user->peran,
        ]);
    }
}   