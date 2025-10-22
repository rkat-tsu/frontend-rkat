<?php

// app/Models/Pengguna.php

// app/Models/Pengguna.php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword; // WAJIB untuk fitur reset password

// Import Notifikasi kustom yang telah Anda buat
use App\Notifications\ResetPasswordNotification; 

class Pengguna extends Authenticatable
{
    use HasFactory, Notifiable, CanResetPassword; // Tambahkan CanResetPassword

    protected $table = 'penggunas'; // Pastikan nama tabel benar
    protected $primaryKey = 'id_pengguna';

    // Kolom yang dapat diisi
    protected $fillable = [
        'username',
        'email', // Kolom email harus ada untuk notifikasi dan reset password
        'password',
        'nama_lengkap',
        'peran',
        'id_departemen',
        'is_aktif',
    ];

    // Kolom yang disembunyikan (hidden)
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Mengganti notifikasi reset password bawaan Laravel.
     * * @param string $token Token reset password yang dihasilkan Laravel.
     * @return void
     */
    public function sendPasswordResetNotification($token): void
    {
        // Panggil notifikasi kustom, passing $token dan instance model ($this).
        $this->notify(new ResetPasswordNotification($token, $this));
    }

    // --- Relasi Lainnya (Contoh) ---
    
    public function departemen()
    {
        return $this->belongsTo(Departemen::class, 'id_departemen', 'id_departemen');
    }
}