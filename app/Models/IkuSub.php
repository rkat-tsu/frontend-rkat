<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IkuSub extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id_ikusub';
    protected $fillable = ['nama_ikusub', 'id_iku'];
    protected $table = 'ikusubs';

    public function iku()
    {
        return $this->belongsTo(Iku::class, 'id_iku', 'id_iku');
    }

    public function ikks()
    {
        return $this->hasMany(Ikk::class, 'id_ikusub', 'id_ikusub');
    }
}
