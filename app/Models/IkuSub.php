<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ikusub extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id_ikusub';
    protected $fillable = ['nama_ikusub', 'id_iku'];
    public $table = 'ikusubs';

    // Relasi ke Iku (Banyak Ikusub dimiliki oleh satu IKU)
    public function iku()
    {
        return $this->belongsTo(Iku::class, 'id_iku', 'id_iku');
    }
    
    // Relasi ke Ikk (Satu Ikusub memiliki banyak IKK)
    public function ikks()
    {
        return $this->hasMany(Ikk::class, 'id_ikusub', 'id_ikusub');
    }
}
