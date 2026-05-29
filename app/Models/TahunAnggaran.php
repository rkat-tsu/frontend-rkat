<?php

// app/Models/TahunAnggaran.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use Illuminate\Database\Eloquent\SoftDeletes;

class TahunAnggaran extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'tahun_anggarans';
    protected $primaryKey = 'id_tahun';
    public $incrementing = true;
    protected $keyType = 'integer';

    protected $fillable = [
        'tahun_anggaran',
        'tanggal_mulai',
        'tanggal_akhir',
        'status_rkat',
        'indikator_labels',
    ];

    protected $casts = [
        'tanggal_mulai' => 'date',
        'tanggal_akhir' => 'date',
        'indikator_labels' => 'array',
    ];
    
    // Relasi ke RkatHeader
    public function rkatHeaders()
    {
        return $this->hasMany(RkatHeader::class, 'tahun_anggaran', 'tahun_anggaran');
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
