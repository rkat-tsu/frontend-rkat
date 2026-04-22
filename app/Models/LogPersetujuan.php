<?php

// app/Models/LogPersetujuan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LogPersetujuan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_log';
    protected $table = 'log_persetujuans';

    protected $fillable = [
        'id_header',
        'id_approver',
        'level_persetujuan',
        'aksi',
        'catatan',
    ];

    // Relasi ke RkatHeader
    public function rkatHeader()
    {
        return $this->belongsTo(RkatHeader::class, 'id_header', 'id_header');
    }
    
    public function approver()
    {
        return $this->belongsTo(User::class, 'id_approver', 'id_user');
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
