<?php

// app/Models/RkatHeader.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RkatHeader extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_header';

    protected $fillable = [
        'tahun_anggaran',
        'id_departemen',
        'diajukan_oleh',
        'nomor_dokumen',
        'judul_pengajuan',
        'status_persetujuan',
        'tanggal_pengajuan',
    ];
    
    // Relasi ke TahunAnggaran
    public function tahunAnggaran()
    {
        return $this->belongsTo(TahunAnggaran::class, 'tahun_anggaran', 'tahun_anggaran');
    }
    
    // Relasi ke Departemen
    public function departemen()
    {
        return $this->belongsTo(Departemen::class, 'id_departemen', 'id_departemen');
    }
    
    // Relasi ke User (yang mengajukan)
    public function pengaju()
    {
        // Asumsi model User Anda ada di App\Models\User dan primary key-nya id_user
        return $this->belongsTo(User::class, 'diajukan_oleh', 'id_user');
    }

    // Relasi ke RkatDetail (satu header punya banyak detail)
    public function details()
    {
        return $this->hasMany(RkatDetail::class, 'id_header', 'id_header');
    }
}