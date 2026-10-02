<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Karyawan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_karyawan';
    protected $table = 'karyawans';

    protected $fillable = [
        'nik',
        'nama',
        'email',
        'no_telepon',
        'id_unit',
        'jabatan',
        'status_pegawai',
        'is_aktif',
    ];

    protected $casts = [
        'is_aktif' => 'boolean',
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

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit')->withTrashed();
    }
}
