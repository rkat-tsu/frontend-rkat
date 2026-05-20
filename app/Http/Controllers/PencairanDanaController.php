<?php

namespace App\Http\Controllers;

use App\Models\PencairanDana;
use App\Models\RkatHeader;
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

        $pencairans = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Pencairan/Index', [
            'pencairans' => $pencairans,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        // Ambil RKAT yang sudah Disetujui_Final dan diajukan oleh user ini (atau unit user ini)
        // dan belum diajukan pencairan
        $existingPencairanIds = PencairanDana::pluck('id_header', null);
        
        $query = RkatHeader::with(['unit'])
            ->where('status_persetujuan', 'Disetujui_Final')
            ->whereNotIn('id_header', $existingPencairanIds);

        if ($user->peran !== 'Admin') {
            $query->where('id_unit', $user->id_unit);
        }

        $rkatList = $query->get();

        return Inertia::render('Pencairan/Create', [
            'rkatList' => $rkatList
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'id_header' => 'required|exists:rkat_headers,id_header'
        ]);

        $rkat = RkatHeader::findOrFail($request->id_header);

        if ($user->peran !== 'Admin' && $rkat->id_unit !== $user->id_unit) {
            abort(403, 'Anda tidak memiliki wewenang untuk mengajukan pencairan untuk unit ini.');
        }

        // Pastikan belum ada
        if (PencairanDana::where('id_header', '=', $request->id_header, 'and')->exists()) {
            return redirect()->back()->with('error', 'Pencairan untuk RKAT ini sudah diajukan.');
        }

        $pencairan = PencairanDana::create([
            'id_header' => $request->id_header,
            'diajukan_oleh' => Auth::id(),
            'status_pencairan' => 'Draft',
        ]);

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
        switch ($pencairan->status_pencairan) {
            case 'Menunggu_BAAK':
                $pencairan->fill([
                    'status_pencairan' => 'Menunggu_Unit_Menaungi',
                    'tanggal_divalidasi_baak' => now()
                ])->save();
                break;
            case 'Menunggu_Unit_Menaungi':
                $pencairan->fill([
                    'status_pencairan' => 'Menunggu_BAUK',
                    'tanggal_diketahui_unit' => now()
                ])->save();
                break;
            case 'Menunggu_BAUK':
                $pencairan->fill([
                    'status_pencairan' => 'Menunggu_WR2',
                    'tanggal_diverifikasi_bauk' => now()
                ])->save();
                break;
            case 'Menunggu_WR2':
                $pencairan->fill([
                    'status_pencairan' => 'Disetujui_Final',
                    'tanggal_disetujui_wr2' => now()
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
                'rkatHeader.rkatDetails',
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
