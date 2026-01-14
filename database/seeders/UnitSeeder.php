<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Pastikan Root (Rektorat Utama) ada sebagai Induk Tertinggi
        // Kita beri kode TSU.00 agar tidak bentrok dengan list gambar
        $root = Unit::updateOrCreate(
            ['nama_unit' => 'Rektorat'],
            [
                'kode_unit' => 'TSU.00',
                'tipe_unit' => 'Rektorat',
                'jalur_persetujuan' => 'non-akademik',
                'parent_id' => null
            ]
        );

        // DATA DARI GAMBAR (TSU.01 - TSU.47)
        // Format: [Kode, Nama, Tipe, Parent_Kode_Target]
        $data = [
            // BIRO & UNIT (Parentnya nanti diarahkan ke WR terkait)
            ['TSU.01', 'BAAK', 'Biro', 'TSU.42'], // Ke WR-1
            ['TSU.02', 'BAKPU', 'Biro', 'TSU.43'], // Ke WR-2
            ['TSU.03', 'BAUK', 'Biro', 'TSU.43'],  // Ke WR-2
            ['TSU.04', 'BPU', 'Biro', 'TSU.43'],   // Ke WR-2

            // PRODI VOKASI (Parent: F. Vokasi / TSU.11)
            ['TSU.05', 'D3-DKV', 'Prodi', 'TSU.11'],
            ['TSU.06', 'D3-DPT', 'Prodi', 'TSU.11'],
            ['TSU.07', 'D3-SI', 'Prodi', 'TSU.11'],
            ['TSU.08', 'D3-TI', 'Prodi', 'TSU.11'],

            // FAKULTAS (Parent: WR-1 / TSU.42)
            ['TSU.09', 'F. SH', 'Fakultas', 'TSU.42'],
            ['TSU.10', 'F. TEKNIK', 'Fakultas', 'TSU.42'],
            ['TSU.11', 'F. VOKASI', 'Fakultas', 'TSU.42'],

            // LEMBAGA & UNIT (Parent: Rektorat / WR)
            ['TSU.12', 'KUI', 'Unit', 'TSU.00'], // Ke Root
            ['TSU.13', 'LPM', 'Lembaga', 'TSU.00'], // Ke Root
            ['TSU.14', 'LPPM', 'Lembaga', 'TSU.00'], // Ke Root
            ['TSU.15', 'Perpustakaan', 'UPT', 'TSU.42'], // Ke WR-1

            // PIC & UNIT KHUSUS (Parent: WR-3 / TSU.44)
            ['TSU.16', 'PIC-CDC-BKK', 'Unit', 'TSU.44'],
            ['TSU.17', 'PIC-Kemahasiswaan', 'Unit', 'TSU.44'],
            ['TSU.18', 'PIC-PKM-P2MW', 'Unit', 'TSU.44'],
            ['TSU.19', 'PIC-WMK', 'Unit', 'TSU.44'],
            ['TSU.20', 'PIC-Akhlakul Karimah', 'Unit', 'TSU.44'],
            ['TSU.21', 'PIC-SIMKATMAWA', 'Unit', 'TSU.44'],

            // UKM (Parent: WR-3 / TSU.44)
            ['TSU.22', 'PIC-UKM-ALVIC', 'UKM', 'TSU.44'],
            ['TSU.23', 'PIC-UKM-BEM', 'UKM', 'TSU.44'],
            ['TSU.24', 'PIC-UKM-CIT', 'UKM', 'TSU.44'],
            ['TSU.25', 'PIC-UKM-English Club', 'UKM', 'TSU.44'],
            ['TSU.26', 'PIC-UKM-FORVOL', 'UKM', 'TSU.44'],
            ['TSU.27', 'PIC-UKM-KORTEGAM', 'UKM', 'TSU.44'], // Typo di gambar 'KORTEGA' disesuaikan
            ['TSU.28', 'PIC-UKM-KSR', 'UKM', 'TSU.44'],
            ['TSU.29', 'PIC-UKM-KWU-KSPM', 'UKM', 'TSU.44'],
            ['TSU.30', 'PIC-UKM-LDK', 'UKM', 'TSU.44'],
            ['TSU.31', 'PIC-UKM-PMKK', 'UKM', 'TSU.44'],
            ['TSU.32', 'PIC-UKM-PSM', 'UKM', 'TSU.44'],
            ['TSU.33', 'PIC-UKM-TSU-SPORT', 'UKM', 'TSU.44'],

            // UPT PMB
            ['TSU.34', 'PMB', 'UPT', 'TSU.42'], // Ke WR-1

            // PRODI TEKNIK (Parent: F. TEKNIK / TSU.10)
            ['TSU.35', 'S1-Informatika', 'Prodi', 'TSU.10'],
            
            // PRODI SH (Parent: F. SH / TSU.09)
            ['TSU.36', 'S1-Manajemen', 'Prodi', 'TSU.09'],
            ['TSU.37', 'S1-PGSD', 'Prodi', 'TSU.09'],
            ['TSU.38', 'S1-Psikologi', 'Prodi', 'TSU.09'],

            // LANJUTAN PRODI TEKNIK (Parent: F. TEKNIK / TSU.10)
            ['TSU.39', 'S1-ReKom', 'Prodi', 'TSU.10'],
            ['TSU.40', 'S1-Sistem Informasi', 'Prodi', 'TSU.10'],

            // SATUAN
            ['TSU.41', 'SPI', 'Satuan', 'TSU.00'], // Ke Root

            // WAKIL REKTOR (Parent: Rektorat / TSU.00)
            ['TSU.42', 'WR-1', 'Rektorat', 'TSU.00'],
            ['TSU.43', 'WR-2', 'Rektorat', 'TSU.00'],
            ['TSU.44', 'WR-3', 'Rektorat', 'TSU.00'],

            // PIC TAMBAHAN (Parent: WR-3 / TSU.44)
            ['TSU.45', 'PIC-KIPK', 'Unit', 'TSU.44'],
            ['TSU.46', 'PIC-PPKS', 'Unit', 'TSU.44'],

            // MARCOMM (Parent: Root atau WR?)
            ['TSU.47', 'Marcomm', 'Unit', 'TSU.00'],
        ];

        // ==========================================
        // TAHAP 1: CREATE / UPDATE DATA UNIT (Tanpa Parent Dulu)
        // ==========================================
        foreach ($data as $item) {
            // Tentukan jalur persetujuan berdasarkan Tipe/Parent logic sederhana
            $jalur = 'non-akademik';
            if (in_array($item[2], ['Prodi', 'Fakultas']) || $item[1] == 'BAAK' || $item[1] == 'WR-1' || $item[1] == 'LPM' || $item[1] == 'LPPM') {
                $jalur = 'akademik';
            }

            Unit::updateOrCreate(
                ['kode_unit' => $item[0]], // Kunci update berdasarkan KODE (TSU.01, dst)
                [
                    'nama_unit' => $item[1],
                    'tipe_unit' => $item[2],
                    'jalur_persetujuan' => $jalur,
                    // Parent ID dikosongkan dulu agar tidak error jika bapaknya belum dibuat
                ]
            );
        }

        // ==========================================
        // TAHAP 2: UPDATE PARENT ID (Relasi)
        // ==========================================
        foreach ($data as $item) {
            $childCode = $item[0];
            $parentCode = $item[3];

            // Cari ID milik Parent berdasarkan Kodenya
            $parent = Unit::where('kode_unit', $parentCode)->first();

            if ($parent) {
                Unit::where('kode_unit', $childCode)->update([
                    'parent_id' => $parent->id_unit
                ]);
            }
        }
    }
}