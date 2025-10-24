<?php

// app/Models/ProgramKerja.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramKerja extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_proker';
    public $table = 'program_kerjas';
    
    protected $fillable = [
        'kode_proker',
        'nama_proker',
        'id_ikk',
    ];
    
    /**
     * Relasi ke Ikk (Banyak Program Kerja dimiliki oleh satu IKK)
     * Digunakan dalam eager loading: ProgramKerja::with(['ikk.ikusub.iku'])
     */
    public function ikk()
    {
        return $this->belongsTo(Ikk::class, 'id_ikk', 'id_ikk');
    }

    /**
     * Relasi ke RkatDetail (Satu Program Kerja dapat muncul di banyak Detail RKAT)
     */
    public function rkatDetails()
    {
        return $this->hasMany(RkatDetail::class, 'id_program', 'id_proker');
    }
}