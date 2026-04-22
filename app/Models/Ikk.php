<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;


class Ikk extends Model
{
    use HasFactory;

    protected $table = 'ikks';
    protected $primaryKey = 'id_ikk';

    protected $fillable = [
        'id_iku',
        'nama_ikk',
    ];

    /**
     * Relasi Balik ke IKU
     */
    public function iku()
    {
        return $this->belongsTo(Iku::class, 'id_iku', 'id_iku');
    }
    
    /**
     * Relasi ke Detail RKAT
     */
    public function rkatDetails()
    {
        return $this->hasMany(RkatDetail::class, 'id_ikk', 'id_ikk');
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