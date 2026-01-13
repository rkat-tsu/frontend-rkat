<?php

namespace Database\Seeders;

use App\Models\Ikk;
use App\Models\Iku;
use Illuminate\Database\Seeder;

class IkuSeeder extends Seeder
{
    public function run(): void
    {
        // IKU 1: Kualitas Lulusan
        $iku1 = Iku::create(['nama_iku' => 'IKU 1: Lulusan Mendapat Pekerjaan yang Layak']);
        Ikk::insert([
            ['id_iku' => $iku1->id_iku, 'nama_ikk' => 'Persentase lulusan S1 yang bekerja/studi lanjut', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku1->id_iku, 'nama_ikk' => 'Jumlah lulusan yang berwirausaha', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku1->id_iku, 'nama_ikk' => 'Pelatihan persiapan karir tingkat akhir', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // IKU 2: Mahasiswa Mendapat Pengalaman di Luar Kampus
        $iku2 = Iku::create(['nama_iku' => 'IKU 2: Mahasiswa Mendapat Pengalaman di Luar Kampus']);
        Ikk::insert([
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'Mahasiswa magang bersertifikat', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'Pertukaran pelajar antar prodi/univ', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'Proyek kemanusiaan/desa binaan', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // IKU 3: Dosen Berkegiatan di Luar Kampus
        $iku3 = Iku::create(['nama_iku' => 'IKU 3: Dosen Berkegiatan di Luar Kampus']);
        Ikk::insert([
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'Dosen praktisi di industri', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'Dosen membina mahasiswa berprestasi nasional', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // IKU 4: Kualifikasi Dosen
        $iku4 = Iku::create(['nama_iku' => 'IKU 4: Praktisi Mengajar di Dalam Kampus & Kualifikasi Dosen']);
        Ikk::insert([
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Dosen tamu dari kalangan profesional', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Dosen lanjut studi S3', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Sertifikasi kompetensi dosen', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // IKU 5: Hasil Kerja Dosen Digunakan Masyarakat
        $iku5 = Iku::create(['nama_iku' => 'IKU 5: Hasil Kerja Dosen Digunakan Masyarakat']);
        Ikk::insert([
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Publikasi jurnal internasional bereputasi', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Karya dosen yang mendapat HKI/Paten', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Pengabdian masyarakat berbasis hasil riset', 'created_at' => now(), 'updated_at' => now()],
        ]);
        
        // IKU 6: Program Studi Bekerjasama dengan Mitra Kelas Dunia
        $iku6 = Iku::create(['nama_iku' => 'IKU 6: Program Studi Bekerjasama dengan Mitra']);
        Ikk::insert([
            ['id_iku' => $iku6->id_iku, 'nama_ikk' => 'Kerjasama kurikulum dengan industri', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku6->id_iku, 'nama_ikk' => 'Joint Research dengan Universitas Luar Negeri', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // IKU 7: Kelas yang Kolaboratif dan Partisipatif
        $iku7 = Iku::create(['nama_iku' => 'IKU 7: Kelas yang Kolaboratif dan Partisipatif']);
        Ikk::insert([
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'Mata kuliah berbasis Case Method', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'Mata kuliah berbasis Team-based Project', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // IKU 8: Program Studi Berstandar Internasional
        $iku8 = Iku::create(['nama_iku' => 'IKU 8: Program Studi Berstandar Internasional']);
        Ikk::insert([
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'Akreditasi Internasional Prodi', 'created_at' => now(), 'updated_at' => now()],
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'Sertifikasi ISO Laboratorium', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}