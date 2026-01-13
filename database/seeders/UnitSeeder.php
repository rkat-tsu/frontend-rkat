<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Level TERTINGGI (Yayasan / Rektorat)
        $rektorat = Unit::create([
            // kode_unit akan otomatis 'TSU.001' lewat boot model
            'nama_unit' => 'Rektorat',
            'tipe_unit' => 'Atasan',
            'jalur_persetujuan' => 'non-akademik',
            'parent_id' => null,
        ]);

        // 2. Unit Pendukung (Biro/Lembaga) - Anak Rektorat
        $biroKeuangan = Unit::create([
            'nama_unit' => 'Biro Keuangan', // TSU.002
            'tipe_unit' => 'Unit',
            'jalur_persetujuan' => 'non-akademik',
            'parent_id' => $rektorat->id_unit,
        ]);

        $lppm = Unit::create([
            'nama_unit' => 'LPPM (Lembaga Penelitian)', // TSU.003
            'tipe_unit' => 'Unit',
            'jalur_persetujuan' => 'akademik',
            'parent_id' => $rektorat->id_unit,
        ]);

        // 3. FAKULTAS
        $ft = Unit::create([
            'nama_unit' => 'Fakultas Teknik', // TSU.004
            'tipe_unit' => 'Fakultas',
            'jalur_persetujuan' => 'akademik',
            'parent_id' => $rektorat->id_unit,
        ]);

        $feb = Unit::create([
            'nama_unit' => 'Fakultas Ekonomi & Bisnis', // TSU.005
            'tipe_unit' => 'Fakultas',
            'jalur_persetujuan' => 'akademik',
            'parent_id' => $rektorat->id_unit,
        ]);

        // 4. PRODI (Anak Fakultas)
        // Anak FT
        Unit::create([
            'nama_unit' => 'S1 Informatika', // TSU.006
            'tipe_unit' => 'Prodi',
            'jalur_persetujuan' => 'akademik',
            'parent_id' => $ft->id_unit,
        ]);
        
        Unit::create([
            'nama_unit' => 'S1 Teknik Sipil', // TSU.007
            'tipe_unit' => 'Prodi',
            'jalur_persetujuan' => 'akademik',
            'parent_id' => $ft->id_unit,
        ]);

        // Anak FEB
        Unit::create([
            'nama_unit' => 'S1 Manajemen', // TSU.008
            'tipe_unit' => 'Prodi',
            'jalur_persetujuan' => 'akademik',
            'parent_id' => $feb->id_unit,
        ]);
    }
}