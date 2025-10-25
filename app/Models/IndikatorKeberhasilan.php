<?php

// app/Models/IndikatorKeberhasilan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndikatorKeberhasilan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_indikator';

    protected $fillable = [
        'capai_2024',
        'capai_2025',
        'capai_2029',
        'target_2025',
        'target_2029',
    ];
    
    // Relasi ke RkatDetail
    public function rkatDetails()
    {
        return $this->hasMany(RkatDetail::class, 'id_indikator', 'id_indikator');
    }
}
