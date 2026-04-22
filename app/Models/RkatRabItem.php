<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }
}