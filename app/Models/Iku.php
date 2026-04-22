<?php

// app/Models/Iku.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Iku extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id_iku';
    protected $fillable = ['nama_iku'];
    protected $table = 'ikus';

    public function ikks()
    {
        return $this->hasMany(Ikk::class, 'id_iku', 'id_iku');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }
}