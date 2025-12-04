<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class IkuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ikus = [
            'Lulusan Mendapat Pekerjaan yang Layak',
            'Mahasiswa Mendapat Pengalaman di Luar Kampus',
            'Dosen Berkegiatan di Luar Kampus',
            'Praktisi Mengajar di Dalam Kampus',
            'Hasil Kerja Dosen Digunakan oleh Masyarakat',
            'Program Studi Bekerja Sama dengan Mitra Kelas Dunia',
            'Kelas yang Kolaboratif dan Partisipatif',
            'Program Studi Berstandar Internasional',
        ];

        $now = Carbon::now();
        $dataToInsert = [];

        foreach ($ikus as $namaIku) {
            $dataToInsert[] = [
                'nama_iku' => $namaIku,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        DB::table('ikus')->insert($dataToInsert);

        $this->command->info('✅ 8 IKU (Indikator Kinerja Utama) berhasil diisi.');
    }
}