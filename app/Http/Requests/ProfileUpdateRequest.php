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
        
        // Daftar Peran yang Konsisten dengan RegisteredUserController (Asumsi ENUM DB Anda)
        $validRoles = [
            'Inputer', 'Kaprodi', 'Kepala_Unit', 'Dekan', 
            'WR_1', 'WR_2', 'WR_3', 'Rektor', 'Admin'
        ];

        return [
            // 1. Nama Lengkap
            'nama_lengkap' => ['required', 'string', 'max:100'], // max:100 sesuai skema
            
            // 2. Username
            'username' => [
                'nullable', // Menggunakan 'nullable' karena di DB skema adalah nullable
                'string', 
                'max:50', // max:50 sesuai skema
                // PERBAIKAN: Menggunakan id_user sebagai PK dan PK key name di ignore
                Rule::unique(User::class)->ignore($user->id_user, 'id_user'), 
            ],
            
            // 3. No. Telepon
            'no_telepon' => ['nullable', 'string', 'max:15'], // <-- PERBAIKAN: Menggunakan 'no_telepon'
            
            // 4. Email
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                // PERBAIKAN: Menggunakan id_user sebagai PK dan PK key name di ignore
                Rule::unique(User::class)->ignore($user->id_user, 'id_user'),
            ],
            
            // 5. peran (Peran)
            'peran' => [ // <-- PERBAIKAN: Menggunakan 'peran'
                // Hanya Admin (user yang sedang login) yang diizinkan untuk mengirim field 'peran'.
                // User non-Admin akan otomatis di-prohibited.
                Rule::when($user->peran !== 'Admin', ['prohibited']),

                // Jika Admin yang mengirim (atau jika field disertakan), validasi Rule::in diterapkan
                'nullable', // Izinkan null jika admin tidak ingin mengubahnya
                Rule::in($validRoles), // <-- PERBAIKAN: Menggunakan daftar peran yang valid
            ]
        ];
    }
}