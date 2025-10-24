<?php

// app/Models/LogPersetujuan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogPersetujuan extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_log';
    protected $table = 'log_persetujuans'; // Pastikan nama tabel benar

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
    
    // Relasi ke User (Approver/Penyetuju)
    public function approver()
    {
        // Asumsi model User Anda ada di App\Models\User dan primary key-nya id_user
        return $this->belongsTo(User::class, 'id_approver', 'id_user');
    }
}
