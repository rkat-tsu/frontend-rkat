<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Lpj extends Model
{
    use HasFactory;

    protected $table = 'lpjs';
    protected $primaryKey = 'id_lpj';

    protected $fillable = [
        'uuid',
        'id_pencairan',
        'nomor_lpj',
        'judul_lpj',
        'tanggal_lpj',
        'tanggal_pelaksanaan_mulai',
        'tanggal_pelaksanaan_selesai',
        'lokasi_kegiatan',
        'ringkasan_kegiatan',
        'total_pencairan',
        'total_realisasi',
        'sisa_dana',
        'status_lpj',
        'catatan',
        'dokumen_bukti',
        'diajukan_oleh',
        'tanggal_pengajuan',
        'disetujui_oleh',
        'tanggal_persetujuan',
    ];

    protected $casts = [
        'tanggal_lpj' => 'date',
        'tanggal_pelaksanaan_mulai' => 'date',
        'tanggal_pelaksanaan_selesai' => 'date',
        'tanggal_pengajuan' => 'datetime',
        'tanggal_persetujuan' => 'datetime',
        'total_pencairan' => 'float',
        'total_realisasi' => 'float',
        'sisa_dana' => 'float',
        'dokumen_bukti' => 'array',
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

    public function pencairanDana()
    {
        return $this->belongsTo(PencairanDana::class, 'id_pencairan', 'id_pencairan');
    }

    public function items()
    {
        return $this->hasMany(LpjItem::class, 'id_lpj', 'id_lpj');
    }

    public function pengaju()
    {
        return $this->belongsTo(User::class, 'diajukan_oleh', 'id_user');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh', 'id_user');
    }
}
