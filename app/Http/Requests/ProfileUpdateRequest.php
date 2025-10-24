<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        return [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            
            // Tambahkan validasi untuk username
            'username' => [
                'required', 
                'string', 
                'max:255', 
                // Harus unik, kecuali ID user yang sedang diupdate
                Rule::unique(User::class)->ignore($user->id), 
            ],
            
            'no_telp' => ['nullable', 'string', 'max:15'], 

            // Validasi email
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                // Harus unik, kecuali ID user yang sedang diupdate
                Rule::unique(User::class)->ignore($user->id),
            ],
            'peran' => [
                // Validasi bahwa nilai 'peran' harus ada di daftar peran yang diizinkan
                'nullable', // Izinkan null jika admin tidak ingin mengirimnya
                Rule::in(['Admin', 'User', 'Super Admin']), // Ganti dengan daftar peran yang valid di aplikasi Anda
                
                // Aturan bersyarat:
                // Jika user yang login adalah 'Admin', maka field 'peran' diizinkan.
                // Jika bukan 'Admin', field 'peran' akan diabaikan (prohibited)
                // Ini mencegah user biasa mengirimkan nilai 'peran'.
                Rule::when($user->peran !== 'Admin', ['prohibited']),
                
                // CATATAN: Karena kita menggunakan 'nullable' dan 'prohibited',
                // Logika required harus ada di controller jika Anda mengharapkan admin 
                // selalu mengirimkan peran, atau biarkan 'nullable' jika peran bersifat opsional.
            ]
        ];
    }
}
