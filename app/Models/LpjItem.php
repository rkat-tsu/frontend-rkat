<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LpjItem extends Model
{
    use HasFactory;

    protected $table = 'lpj_items';
    protected $primaryKey = 'id_lpj_item';

    protected $fillable = [
        'uuid',
        'id_lpj',
        'id_pencairan_item',
        'volume_realisasi',
        'harga_satuan_realisasi',
        'sub_total_realisasi',
        'selisih',
        'nomor_kwitansi',
        'keterangan',
    ];

    protected $casts = [
        'volume_realisasi' => 'float',
        'harga_satuan_realisasi' => 'float',
        'sub_total_realisasi' => 'float',
        'selisih' => 'float',
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

    public function lpj()
    {
        return $this->belongsTo(Lpj::class, 'id_lpj', 'id_lpj');
    }

    public function pencairanItem()
    {
        return $this->belongsTo(PencairanDanaItem::class, 'id_pencairan_item', 'id_pencairan_item');
    }
}
