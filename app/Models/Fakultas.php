<?php

// app/Models/Fakultas.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fakultas extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id_fakultas';
    protected $table = 'fakultas';

    protected $fillable = [
        'nama_fakultas',
        'id_dekan',
    ];

    /**
     * Relasi ke User (Dekan)
     * Satu Fakultas dimiliki oleh satu Dekan (User).
     */
    public function dekan()
    {
        // Asumsi model User Anda ada di App\Models\User dan primary key-nya id_user
        return $this->belongsTo(User::class, 'id_dekan', 'id_user');
    }

    /**
     * Relasi ke Departemen
     * Satu Fakultas memiliki banyak Departemen.
     */
    public function departemens()
    {
        return $this->hasMany(Departemen::class, 'id_fakultas', 'id_fakultas');
    }
}
