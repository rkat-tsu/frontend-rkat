<?php

// app/Models/RkatHeader.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; 

class RkatHeader extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_header';

    protected $fillable = [
        'tahun_anggaran',
        'id_unit',
        'diajukan_oleh',
        'nomor_dokumen',
        'status_persetujuan',
        'tanggal_pengajuan',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
    ];
    
    // Relasi ke TahunAnggaran
    public function tahunAnggaran()
    {
        return $this->belongsTo(TahunAnggaran::class, 'tahun_anggaran', 'tahun_anggaran');
    }
    
    // Relasi ke User (yang mengajukan)
    public function user()
    {
        // Asumsi model User Anda ada di App\Models\User dan primary key-nya id_user
        return $this->belongsTo(User::class, 'diajukan_oleh', 'id_user');
    }

    // Fungsi ini sekarang sudah benar karena 'use' statement di atas
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit');
    }

    public function rkatDetails()
    {
        return $this->hasMany(RkatDetail::class, 'id_header', 'id_header');
    }

    public function logPersetujuans()
    {
        return $this->hasMany(LogPersetujuan::class, 'id_header', 'id_header');
    }

    /**
     * Generate a sequential document number for RKAT per year and unit.
     * Format: RKAT-{tahun}-{unit}-{sequence:04}
     */
    public static function generateNomorDokumen(int $tahunAnggaran, int $idUnit): string
    {
        $prefix = sprintf('RKAT-%d-%d', $tahunAnggaran, $idUnit);

        // Find last nomor_dokumen for same year and unit and increment sequence
        $last = self::where('tahun_anggaran', $tahunAnggaran)
            ->where('id_unit', $idUnit)
            ->where('nomor_dokumen', 'like', $prefix . '%')
            ->orderBy('id_header', 'desc')
            ->value('nomor_dokumen');

        $nextSeq = 1;
        if ($last) {
            // extract trailing sequence (assumes suffix like -0001)
            $parts = explode('-', $last);
            $lastSeq = intval(end($parts));
            $nextSeq = $lastSeq + 1;
        }

        return sprintf('%s-%04d', $prefix, $nextSeq);
    }
}