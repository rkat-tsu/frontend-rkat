<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class PencairanDanaItem extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_pencairan_item';
    protected $table = 'pencairan_dana_items';

    protected $fillable = [
        'id_pencairan',
        'id_rkat_rab_item',
        'volume_pencairan',
        'nominal_pencairan',
        'sub_total_pencairan',
    ];

    public function pencairanDana()
    {
        return $this->belongsTo(PencairanDana::class, 'id_pencairan', 'id_pencairan');
    }

    public function rkatRabItem()
    {
        return $this->belongsTo(RkatRabItem::class, 'id_rkat_rab_item', 'id');
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
