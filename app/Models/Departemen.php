<?php

// app/Models/Departemen.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departemen extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_departemen';

    protected $fillable = [
        'kode_departemen',
        'nama_departemen',
        'tipe',
        'id_fakultas',
        'id_kepala',
    ];
    
    // Relasi ke RkatHeader
    public function rkatHeaders()
    {
        return $this->hasMany(RkatHeader::class, 'id_departemen', 'id_departemen');
    }

    // Relasi ke Fakultas (jika diperlukan)
    public function fakultas()
    {
        return $this->belongsTo(Fakultas::class, 'id_fakultas', 'id_fakultas');
    }
    
    // Relasi ke User (Kepala Departemen)
    public function kepala()
    {
        return $this->belongsTo(User::class, 'id_kepala', 'id_user');
    }
}
