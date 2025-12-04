<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
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

        $AdminEmail = 'admin@gmail.com';

        if (User::where('email', $AdminEmail)->doesntExist()) {
            User::create([
                // Kredensial Login
                'username' => 'superadmin',
                'email' => $AdminEmail,
                'password' => Hash::make('Admin123'),
                'email_verified_at' => Carbon::now(),

                // Data Pengguna
                'nama_lengkap' => 'Super Administrator',
                'no_telepon' => '081234567890',

                'peran' => 'Admin',

                'is_aktif' => true,
            ]);
            $this->command->info('✅ Akun Administrator berhasil dibuat.');
        } else {
            $this->command->info('Akun Administrator sudah ada, dilewati.');
        }
    }
}
