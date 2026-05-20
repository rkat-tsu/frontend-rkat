<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PencairanDana extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_pencairan';
    protected $table = 'pencairan_danas';

    protected $fillable = [
        'id_header',
        'diajukan_oleh',
        'status_pencairan',
        'tanggal_pengajuan',
        'tanggal_divalidasi_baak',
        'tanggal_diketahui_unit',
        'tanggal_diverifikasi_bauk',
        'tanggal_disetujui_wr2',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
        'tanggal_divalidasi_baak' => 'datetime',
        'tanggal_diketahui_unit' => 'datetime',
        'tanggal_diverifikasi_bauk' => 'datetime',
        'tanggal_disetujui_wr2' => 'datetime',
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

    public function rkatHeader()
    {
        return $this->belongsTo(RkatHeader::class, 'id_header', 'id_header');
    }

    public function pengaju()
    {
        return $this->belongsTo(User::class, 'diajukan_oleh', 'id_user');
    }
}
