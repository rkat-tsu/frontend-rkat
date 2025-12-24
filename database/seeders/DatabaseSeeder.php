<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Unit;
use App\Models\TahunAnggaran;
use App\Models\RincianAnggaran;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            IkuSeeder::class,
        ]);

        // Ensure a default unit exists for seeded admin user
        $unit = Unit::firstOrCreate(
            ['kode_unit' => 'ADMIN'],
            [
                'nama_unit' => 'Unit Administrasi Sistem',
                'tipe_unit' => 'Lainnya',
                'jalur_persetujuan' => 'non-akademik',
            ]
        );
        $AdminEmail = 'admin@gmail.com';

        if (User::where('email', $AdminEmail)->doesntExist()) {
            $userData = [
                // Kredensial Login
                'username' => 'superadmin',
                'email' => $AdminEmail,
                'password' => Hash::make('Admin123'),

                // Data Pengguna
                'nama_lengkap' => 'Super Administrator',
                'no_telepon' => '081234567890',
                'id_unit' => $unit->id_unit,

                'peran' => 'Admin',

                'is_aktif' => true,
            ];

            // Only include `email_verified_at` if the column exists in the users table
            if (Schema::hasColumn('users', 'email_verified_at')) {
                $userData['email_verified_at'] = Carbon::now();
            }

            User::create($userData);
            $this->command->info('✅ Akun Administrator berhasil dibuat.');
        } else {
            $this->command->info('Akun Administrator sudah ada, dilewati.');
        }
    }
}
