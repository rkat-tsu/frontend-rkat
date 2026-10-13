<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisKegiatanOption extends Model
{
    protected $table = 'jenis_kegiatan_options';

    protected $fillable = ['grup', 'kode_grup', 'nama', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
