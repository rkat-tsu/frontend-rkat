<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword; // WAJIB untuk fitur reset password

// Import Notifikasi kustom yang telah Anda buat
use App\Notifications\ResetPasswordNotification; 
// Jika model Departemen berada di namespace yang sama atau di App\Models
use App\Models\Departemen; 
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, CanResetPassword; // Tambahkan CanResetPassword

    protected $table = 'users'; // Nama tabel sudah sesuai
    protected $primaryKey = 'id_user'; // Kunci utama sudah sesuai
    
    // Kolom yang dapat diisi
    protected $fillable = [
        'username',
        'email', 
        'password',
        'nama_lengkap',
        'peran',
        'id_unit',
        'is_aktif',
        'nomor_telepon',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    /**
     * Mengganti notifikasi reset password bawaan Laravel.
     *
     * @param string $token Token reset password yang dihasilkan Laravel.
     * @return void
     */
    public function sendPasswordResetNotification($token): void
    {
        // Panggil notifikasi kustom, passing $token dan instance model ($this).
        $this->notify(new ResetPasswordNotification($token, $this));
    }

    // --- Relasi Lainnya (Contoh) ---
    
    public function isAdmin(): bool
    {
        return $this->peran === 'Admin';
    }

    public function isApprover(): bool
    {
        return in_array($this->peran, ['Dekan', 'Kepala_Unit', 'WR_1', 'WR_2', 'WR_3', 'Rektor']);
    }

    public function isUnitHead(): bool
    {
        return in_array($this->peran, ['Dekan', 'Kepala_Unit']);
    }

    public function unit(): BelongsTo
    {
        // id_unit di tabel users merujuk ke id_unit di tabel unit
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit');
    }
}