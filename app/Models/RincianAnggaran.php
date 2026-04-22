<?php

// app/Models/AkunAnggaran.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        'satuan',
        'nominal',
        'kelompok_anggaran',
    ];

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
