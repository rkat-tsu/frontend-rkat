<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        foreach (['Tetap', 'Kontrak', 'Dosen Tetap', 'Dosen LB', 'Tendik', 'Honorer', 'Lainnya'] as $name) {
            $exists = DB::table('jenis_kegiatan_options')
                ->where('kode_grup', 'status_pegawai')
                ->where('nama', $name)
                ->exists();

            if (!$exists) {
                DB::table('jenis_kegiatan_options')->insert([
                    'grup' => 'Data SDM / Karyawan',
                    'kode_grup' => 'status_pegawai',
                    'nama' => $name,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Keep option rows so existing employee records remain interpretable on rollback.
    }
};
