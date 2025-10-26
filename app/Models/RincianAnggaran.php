<?php

// app/Models/AkunAnggaran.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RincianAnggaran extends Model
{
    use HasFactory;
    
    // Primary key non-standar (bukan 'id')
    protected $primaryKey = 'kode_anggaran';
    protected $table = 'rincian_anggarans';
    protected $keyType = 'string';

    protected $fillable = [
        'kode_anggaran', 
        'nama_anggaran', 
        'kelompok_anggaran', 
        'pagu_limit',
    ];
}
