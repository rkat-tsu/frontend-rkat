<?php

// app/Models/Ikk.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ikk extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id_ikk';
    protected $fillable = ['nama_ikk', 'id_ikusub'];
    protected $table = 'ikks';

    // Relasi ke Ikusub (Banyak IKK dimiliki oleh satu Ikusub)
    public function ikuSub()
    {
        return $this->belongsTo(IkuSub::class, 'id_ikusub', 'id_ikusub');
    }
    
    // Relasi ke ProgramKerja (Satu IKK memiliki banyak Program Kerja)
    public function programKerjas()
    {
        return $this->hasMany(ProgramKerja::class, 'id_ikk', 'id_ikk');
    }
}
