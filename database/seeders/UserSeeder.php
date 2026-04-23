<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        // --- 1. SUPER ADMIN (IT / Administrator) ---
        User::create([
            'nama_lengkap' => 'Administrator Sistem',
            'username'     => 'admin',
            'email'        => 'admin@tsu.ac.id',
            'password'     => $defaultPassword, 
            'peran'        => 'Admin',
            'id_unit'      => null,
            'no_telepon'   => '081234567890',
            'is_aktif'     => true,
        ]);

        // --- AMBIL ID UNIT DARI DATABASE (Hasil UnitSeeder) ---
        $rektorat     = Unit::where('nama_unit', 'Rektorat')->first();
        $ft           = Unit::where('nama_unit', 'Fakultas Teknik')->first();
        $feb          = Unit::where('nama_unit', 'Fakultas Ekonomi & Bisnis')->first();
        $if           = Unit::where('nama_unit', 'S1 Informatika')->first();
        $sipil        = Unit::where('nama_unit', 'S1 Teknik Sipil')->first();
        $manajemen    = Unit::where('nama_unit', 'S1 Manajemen')->first();
        $biroKeu      = Unit::where('nama_unit', 'Biro Keuangan')->first();
        $lppm         = Unit::where('nama_unit', 'LPPM (Lembaga Penelitian)')->first();

        // --- 2. PIMPINAN TINGGI (REKTORAT) ---
        
        // Rektor
        User::create([
            'nama_lengkap' => 'Prof. Dr. Rektor TSU',
            'username'     => 'rektor',
            'email'        => 'rektor@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Rektor',
            'id_unit'      => $rektorat?->id_unit,
            'is_aktif'     => true,
        ]);

        // Wakil Rektor 1 (Akademik)
        User::create([
            'nama_lengkap' => 'Dr. WR Satu (Akademik)',
            'username'     => 'wr1',
            'email'        => 'wr1@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'WR_1',
            'id_unit'      => $rektorat?->id_unit,
            'is_aktif'     => true,
        ]);

        // Wakil Rektor 2 (Keuangan/SDM)
        User::create([
            'nama_lengkap' => 'Dr. WR Dua (Keuangan)',
            'username'     => 'wr2',
            'email'        => 'wr2@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'WR_2',
            'id_unit'      => $rektorat?->id_unit,
            'is_aktif'     => true,
        ]);

        // Wakil Rektor 3 (Kemahasiswaan)
        User::create([
            'nama_lengkap' => 'Dr. WR Tiga (Kemahasiswaan)',
            'username'     => 'wr3',
            'email'        => 'wr3@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'WR_3',
            'id_unit'      => $rektorat?->id_unit,
            'is_aktif'     => true,
        ]);

        // --- 3. DEKAN FAKULTAS ---
        
        // Dekan Teknik
        User::create([
            'nama_lengkap' => 'Prof. Dekan Teknik',
            'username'     => 'dekan.ft',
            'email'        => 'dekan.ft@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Dekan',
            'id_unit'      => $ft?->id_unit,
            'is_aktif'     => true,
        ]);

        // Dekan Ekonomi
        User::create([
            'nama_lengkap' => 'Dr. Dekan Ekonomi',
            'username'     => 'dekan.feb',
            'email'        => 'dekan.feb@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Dekan',
            'id_unit'      => $feb?->id_unit,
            'is_aktif'     => true,
        ]);

        // --- 4. KAPRODI (Unit Pengusul Utama) ---

        // Kaprodi Informatika
        User::create([
            'nama_lengkap' => 'Kaprodi Informatika',
            'username'     => 'kaprodi.if',
            'email'        => 'kaprodi.if@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Kaprodi',
            'id_unit'      => $if?->id_unit,
            'is_aktif'     => true,
        ]);

        // Kaprodi Sipil
        User::create([
            'nama_lengkap' => 'Kaprodi Sipil',
            'username'     => 'kaprodi.sipil',
            'email'        => 'kaprodi.sipil@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Kaprodi',
            'id_unit'      => $sipil?->id_unit,
            'is_aktif'     => true,
        ]);

        // Kaprodi Manajemen
        User::create([
            'nama_lengkap' => 'Kaprodi Manajemen',
            'username'     => 'kaprodi.mnj',
            'email'        => 'kaprodi.mnj@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Kaprodi',
            'id_unit'      => $manajemen?->id_unit,
            'is_aktif'     => true,
        ]);

        // --- 5. KEPALA UNIT / BIRO ---

        // Kepala Biro Keuangan
        User::create([
            'nama_lengkap' => 'Kepala Biro Keuangan',
            'username'     => 'kabiro.keu',
            'email'        => 'keuangan@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Kepala_Unit',
            'id_unit'      => $biroKeu?->id_unit,
            'is_aktif'     => true,
        ]);

        // Kepala LPPM
        User::create([
            'nama_lengkap' => 'Kepala LPPM',
            'username'     => 'ka.lppm',
            'email'        => 'lppm@tsu.ac.id',
            'password'     => $defaultPassword,
            'peran'        => 'Kepala_Unit',
            'id_unit'      => $lppm?->id_unit,
            'is_aktif'     => true,
        ]);

        $testerRoles = [
            'Inputer'     => $if?->id_unit,        // Simulasi staf di Prodi Informatika
            'Kaprodi'     => $if?->id_unit,        // Simulasi Kaprodi Informatika
            'Kepala_Unit' => $biroKeu?->id_unit,   // Simulasi Kepala Biro Keuangan
            'Dekan'       => $ft?->id_unit,        // Simulasi Dekan Fakultas Teknik
            'WR_1'        => $rektorat?->id_unit,  // Simulasi WR 1
            'WR_2'        => $rektorat?->id_unit,  // Simulasi WR 2
            'WR_3'        => $rektorat?->id_unit,  // Simulasi WR 3
            'Rektor'      => $rektorat?->id_unit,  // Simulasi Rektor
        ];

        foreach ($testerRoles as $role => $unitId) {
            // Mengubah format nama role untuk email & username (Contoh: Kepala_Unit -> kepala_unit)
            $roleLower = strtolower($role); 

            User::create([
                'nama_lengkap' => "Tester $role",
                'username'     => "test_{$roleLower}",
                'email'        => "tester.{$roleLower}@dummy.tsu.ac.id",
                'password'     => $defaultPassword,
                'peran'        => $role,
                'id_unit'      => $unitId,
                'is_aktif'     => true,
            ]);
        }
    }
}