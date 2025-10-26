<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RkatRabItem extends Model
{
    use HasFactory;
    
    protected $table = 'rkat_rab_items';

    protected $fillable = [
        'id_rkat_detail',
        'kode_anggaran', // Kode akun anggaran master untuk item ini
        'deskripsi_item',
        'volume',
        'satuan',
        'harga_satuan',
        'sub_total',
    ];

    public function rkatDetail()
    {
        return $this->belongsTo(RkatDetail::class, 'id_rkat_detail', 'id_rkat_detail');
    }

    public function rincianAnggaran()
    {
        return $this->belongsTo(RincianAnggaran::class, 'kode_anggaran', 'kode_anggaran');
    }
}