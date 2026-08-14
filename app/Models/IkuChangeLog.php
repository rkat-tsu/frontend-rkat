<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class IkuChangeLog extends Model
{
    use HasFactory;

    protected $table = 'iku_change_logs';
    protected $primaryKey = 'id_log';

    protected $fillable = [
        'id_iku',
        'id_user',
        'tahun_anggaran',
        'tipe_entitas',
        'aksi',
        'nama_entitas',
        'ringkasan_perubahan',
        'detail_perubahan',
    ];

    protected $casts = [
        'detail_perubahan' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function iku()
    {
        return $this->belongsTo(Iku::class, 'id_iku', 'id_iku')->withTrashed();
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
}
