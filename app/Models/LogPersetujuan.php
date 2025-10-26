<?php

// app/Models/LogPersetujuan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogPersetujuan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_log';
    protected $table = 'log_persetujuans';

    protected $fillable = [
        'id_header',
        'id_approver',
        'level_persetujuan',
        'aksi',
        'catatan',
    ];

    // Relasi ke RkatHeader
    public function rkatHeader()
    {
        return $this->belongsTo(RkatHeader::class, 'id_header', 'id_header');
    }
    
    public function approver()
    {
        return $this->belongsTo(User::class, 'id_approver', 'id_user');
    }
}
