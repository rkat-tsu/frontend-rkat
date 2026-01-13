<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}