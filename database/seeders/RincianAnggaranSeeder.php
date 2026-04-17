<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RincianAnggaranSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data diambil dari Lampiran I & II Peraturan Rektor No: 220.A/PR/REK/III/2025
        // Tentang Standar Biaya Operasional (SBO) Universitas Tiga Serangkai

        $data = [
            // --- A. KONSUMSI RAPAT & PERTEMUAN (Lampiran I - Hal 4) ---
            [
                'kode_anggaran' => 'A.1.1',
                'nama_anggaran' => 'Kudapan Rapat Koordinasi Internal',
                'satuan' => 'Orang/Hari',
                'nominal' => 10000,
            ],
            [
                'kode_anggaran' => 'A.1.2',
                'nama_anggaran' => 'Makan Prasmanan Rapat (Pejabat/Tamu Khusus)',
                'satuan' => 'Orang/Hari',
                'nominal' => 90000,
            ],
            [
                'kode_anggaran' => 'A.1.3.1',
                'nama_anggaran' => 'Makan Panitia Wisuda/Rapat Khusus',
                'satuan' => 'Orang/Hari',
                'nominal' => 25000,
            ],
            [
                'kode_anggaran' => 'A.1.3.2',
                'nama_anggaran' => 'Konsumsi Wisudawan & Orang Tua',
                'satuan' => 'Orang/Hari',
                'nominal' => 30000,
            ],
            [
                'kode_anggaran' => 'A.2.1',
                'nama_anggaran' => 'Paket Meeting Halfday (Luar Kantor)',
                'satuan' => 'Orang/Hari',
                'nominal' => 150000,
            ],
            [
                'kode_anggaran' => 'A.2.2',
                'nama_anggaran' => 'Paket Meeting Fullday (Luar Kantor)',
                'satuan' => 'Orang/Hari',
                'nominal' => 250000,
            ],
            [
                'kode_anggaran' => 'A.2.3',
                'nama_anggaran' => 'Paket Meeting Fullboard (Luar Kantor/Menginap)',
                'satuan' => 'Orang/Hari',
                'nominal' => 600000,
            ],

            // --- A. TRANSPORTASI & BBM (Lampiran I - Hal 9) ---
            [
                'kode_anggaran' => 'A.5',
                'nama_anggaran' => 'Transportasi Kegiatan Wilayah Solo Raya',
                'satuan' => 'Orang/Kali',
                'nominal' => 150000,
            ],
            [
                'kode_anggaran' => 'A.6',
                'nama_anggaran' => 'Bantuan BBM Kendaraan Pegawai',
                'satuan' => 'Orang/Hari',
                'nominal' => 20000,
            ],

            // --- B. HONORARIUM AKADEMIK (Lampiran I - Hal 10) ---
            [
                'kode_anggaran' => 'B.1.1',
                'nama_anggaran' => 'Honor Pengajar S1/D3 - Guru Besar',
                'satuan' => 'SKS/Hadir',
                'nominal' => 300000,
            ],
            [
                'kode_anggaran' => 'B.1.2',
                'nama_anggaran' => 'Honor Pengajar S1/D3 - Lektor Kepala',
                'satuan' => 'SKS/Hadir',
                'nominal' => 250000,
            ],
            [
                'kode_anggaran' => 'B.1.3',
                'nama_anggaran' => 'Honor Pengajar S1/D3 - Lektor',
                'satuan' => 'SKS/Hadir',
                'nominal' => 200000,
            ],
            [
                'kode_anggaran' => 'B.1.4',
                'nama_anggaran' => 'Honor Pengajar S1/D3 - Asisten Ahli',
                'satuan' => 'SKS/Hadir',
                'nominal' => 150000,
            ],
            [
                'kode_anggaran' => 'B.1.7',
                'nama_anggaran' => 'Honor Pembimbing Skripsi/TA',
                'satuan' => 'Orang/Mhs',
                'nominal' => 750000,
            ],
            [
                'kode_anggaran' => 'B.1.8',
                'nama_anggaran' => 'Honor Penguji Skripsi/TA',
                'satuan' => 'Orang/Mhs',
                'nominal' => 150000,
            ],

            // --- B. HONORARIUM NARASUMBER (Lampiran I - Hal 12) ---
            [
                'kode_anggaran' => 'B.3.1.1',
                'nama_anggaran' => 'Honor Narasumber Pakar/Profesional (Nasional)',
                'satuan' => 'Orang/Jam',
                'nominal' => 1700000,
            ],
            [
                'kode_anggaran' => 'B.3.1.2',
                'nama_anggaran' => 'Honor Moderator (Nasional)',
                'satuan' => 'Orang/Datang',
                'nominal' => 700000,
            ],
            [
                'kode_anggaran' => 'B.3.2.1',
                'nama_anggaran' => 'Honor Narasumber Pakar/Profesional (Internasional)',
                'satuan' => 'Orang/Jam',
                'nominal' => 2550000,
            ],

            // --- B. HONORARIUM PANITIA (Lampiran I - Hal 13) ---
            [
                'kode_anggaran' => 'B.4.1.1',
                'nama_anggaran' => 'Honor Panitia - Penanggung Jawab',
                'satuan' => 'Orang/Kegiatan',
                'nominal' => 450000,
            ],
            [
                'kode_anggaran' => 'B.4.1.2',
                'nama_anggaran' => 'Honor Panitia - Ketua',
                'satuan' => 'Orang/Kegiatan',
                'nominal' => 400000,
            ],
            [
                'kode_anggaran' => 'B.4.1.3',
                'nama_anggaran' => 'Honor Panitia - Anggota',
                'satuan' => 'Orang/Kegiatan',
                'nominal' => 200000,
            ],

            // --- C. KESEJAHTERAAN (Lampiran I - Hal 16) ---
            [
                'kode_anggaran' => 'C.3.3.a',
                'nama_anggaran' => 'Santunan Duka Cita (Pegawai)',
                'satuan' => 'Orang/Kejadian',
                'nominal' => 2500000,
            ],
            [
                'kode_anggaran' => 'C.3.3.b',
                'nama_anggaran' => 'Santunan Duka Cita (Keluarga Inti)',
                'satuan' => 'Orang/Kejadian',
                'nominal' => 1500000,
            ],

            // --- D. KEMAHASISWAAN (Lampiran I - Hal 17) ---
            [
                'kode_anggaran' => 'D.1.1',
                'nama_anggaran' => 'Beasiswa Prestasi Juara I Internasional',
                'satuan' => 'Prestasi',
                'nominal' => 5000000,
            ],
            [
                'kode_anggaran' => 'D.2.1',
                'nama_anggaran' => 'Beasiswa Prestasi Juara I Nasional',
                'satuan' => 'Prestasi',
                'nominal' => 2500000,
            ],
            [
                'kode_anggaran' => 'D.4.1',
                'nama_anggaran' => 'Dana Kewirausahaan Individu',
                'satuan' => 'Kegiatan',
                'nominal' => 5000000,
            ],
            [
                'kode_anggaran' => 'D.4.2',
                'nama_anggaran' => 'Dana Kewirausahaan Kelompok',
                'satuan' => 'Kegiatan',
                'nominal' => 8000000,
            ],

            // --- LAMPIRAN II: UANG HARIAN PERJALANAN DINAS (Estimasi) ---
            // Mengambil sampel provinsi besar (Hal 22)
            [
                'kode_anggaran' => 'A.2.13',
                'nama_anggaran' => 'Uang Harian Perjadin - DKI Jakarta',
                'satuan' => 'Orang/Hari',
                'nominal' => 530000,
            ],
            [
                'kode_anggaran' => 'A.2.14',
                'nama_anggaran' => 'Uang Harian Perjadin - Jawa Tengah',
                'satuan' => 'Orang/Hari',
                'nominal' => 370000,
            ],
            [
                'kode_anggaran' => 'A.2.15',
                'nama_anggaran' => 'Uang Harian Perjadin - D.I Yogyakarta',
                'satuan' => 'Orang/Hari',
                'nominal' => 420000,
            ],
            [
                'kode_anggaran' => 'A.2.16',
                'nama_anggaran' => 'Uang Harian Perjadin - Jawa Timur',
                'satuan' => 'Orang/Hari',
                'nominal' => 410000,
            ],
            [
                'kode_anggaran' => 'A.2.17',
                'nama_anggaran' => 'Uang Harian Perjadin - Bali',
                'satuan' => 'Orang/Hari',
                'nominal' => 480000,
            ],

            // --- LAMPIRAN II: PENGINAPAN (Sampel Golongan C - Pejabat Struktural/Dosen) ---
            [
                'kode_anggaran' => 'A.4.13.C',
                'nama_anggaran' => 'Penginapan DKI Jakarta (Gol C)',
                'satuan' => 'Orang/Hari',
                'nominal' => 992000,
            ],
            [
                'kode_anggaran' => 'A.4.14.C',
                'nama_anggaran' => 'Penginapan Jawa Tengah (Gol C)',
                'satuan' => 'Orang/Hari',
                'nominal' => 954000,
            ],
            [
                'kode_anggaran' => 'A.4.15.C',
                'nama_anggaran' => 'Penginapan D.I Yogyakarta (Gol C)',
                'satuan' => 'Orang/Hari',
                'nominal' => 1384000,
            ],
        ];

        // Masukkan ke database (Gunakan upsert agar tidak duplikat jika dijalankan ulang)
        // Asumsi nama tabel adalah 'rincian_anggarans' atau 'akun_anggarans' 
        // Sesuaikan dengan nama tabel Master Anggaran di database Anda.
        foreach ($data as $item) {
            DB::table('rincian_anggarans')->updateOrInsert(
                ['kode_anggaran' => $item['kode_anggaran']], // Kunci pengecekan
                [
                    'nama_anggaran' => $item['nama_anggaran'],
                    'satuan' => $item['satuan'],
                    'nominal' => $item['nominal'], // Pastikan kolom ini ada di migrasi (misal: nominal atau plafon)
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]
            );
        }
    }
}