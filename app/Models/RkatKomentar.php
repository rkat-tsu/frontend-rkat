<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RkatKomentar extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_komentar';
    protected $table = 'rkat_komentars';

    protected $fillable = [
        'id_header',
        'id_user',
        'pesan',
        'lampiran_path',
    ];

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

    public function header()
    {
        return $this->belongsTo(RkatHeader::class, 'id_header', 'id_header');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
