<?php

// app/Models/AkunAnggaran.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AkunAnggaran extends Model
{
    use HasFactory;
    
    // Primary key non-standar (bukan 'id')
    protected $primaryKey = 'kode_akun';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kode_akun',
        'nama_akun',
        'volume',
        'satuan',
        'harga_satuan',
        'total_harga',
        'kelompok_akun',
        'pagu_limit',
    ];

    // Relasi ke RkatDetail
    public function rkatDetails()
    {
        return $this->hasMany(RkatDetail::class, 'kode_akun', 'kode_akun');
    }
}
