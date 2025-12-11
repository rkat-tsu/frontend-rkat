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
    public function pengaju()
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
}