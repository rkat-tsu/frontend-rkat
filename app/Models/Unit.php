<?php

// app/Models/Unit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_unit';
    protected $table = 'unit';
    protected $fillable = [
        'kode_unit',
        'nama_unit',
        'tipe_unit',
        'jalur_persetujuan',
        'id_kepala',
        'parent_id',
        'no_telepon',
        'email',
    ];

    // Enum values for tipe_unit: 'Fakultas', 'Prodi', 'Unit', 'Lainnya', 'Atasan', 'Admin'
    // Enum values for jalur_persetujuan: 'akademik', 'non-akademik'
    
    // Relasi ke RkatHeader
    public function parent()
    {
        return $this->belongsTo(Unit::class, 'parent_id', 'id_unit');
    }
    
    public function children()
    {
        return $this->hasMany(Unit::class, 'parent_id', 'id_unit');
    }

    // Relasi Kepala Unit
    public function kepala()
    {
        return $this->belongsTo(User::class, 'id_kepala', 'id_user'); // Asumsi model User ada dan PK-nya id_user
    }
    
    // Relasi ke RKAT
    public function rkatHeaders()
    {
        return $this->hasMany(RkatHeader::class, 'id_unit', 'id_unit');
    }
}
