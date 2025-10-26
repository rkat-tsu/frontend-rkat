<?php

// app/Models/TahunAnggaran.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TahunAnggaran extends Model
{
    use HasFactory;

    // Primary key non-standar (bukan 'id')
    protected $table = 'tahun_anggarans';
    protected $primaryKey = 'tahun_anggaran';
    public $incrementing = false;
    protected $keyType = 'integer';

    protected $fillable = [
        'tahun_anggaran',
        'tanggal_mulai',
        'tanggal_akhir',
        'status_rkat',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_akhir' => 'date',
    ];
    
    // Relasi ke RkatHeader
    public function rkatHeaders()
    {
        return $this->hasMany(RkatHeader::class, 'tahun_anggaran', 'tahun_anggaran');
    }
}
