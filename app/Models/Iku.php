<?php

// app/Models/Iku.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id_iku';
    protected $fillable = ['nama_iku'];
    public $table = 'ikus'; // Secara eksplisit, karena nama tabel jamak tidak standar

    // Relasi ke Ikusub (Satu IKU memiliki banyak Ikusub)
    public function ikusubs()
    {
        return $this->hasMany(Ikusub::class, 'id_iku', 'id_iku');
    }
}