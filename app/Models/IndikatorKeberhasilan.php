<?php

// app/Models/IndikatorKeberhasilan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model; 
use Illuminate\Support\Str;

class IndikatorKeberhasilan extends Model
{
    use HasFactory;

    protected $table = 'indikator_keberhasilans';

    protected $primaryKey = 'id_indikator';

    protected $fillable = [
        'id_rkat_detail',
        'nama_indikator',
        'capai_2025',
        'target_2026',
        'capai_2026',
        'target_2029',
        'capai_2029',
    ];

    // Relasi ke RkatDetail
    public function rkatDetails()
    {
        return $this->hasMany(RkatDetail::class, 'id_indikator', 'id_indikator');
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
