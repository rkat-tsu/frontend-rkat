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
        'nama_pencairan',
        'status_pencairan',
        'current_step_id',
        'tanggal_pengajuan',
        'approval_dates',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
        'approval_dates' => 'array',
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

    public function currentStep()
    {
        return $this->belongsTo(ApprovalPathStep::class, 'current_step_id');
    }

    public function items()
    {
        return $this->hasMany(PencairanDanaItem::class, 'id_pencairan', 'id_pencairan');
    }

}
