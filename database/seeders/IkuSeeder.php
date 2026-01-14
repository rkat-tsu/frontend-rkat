<?php

namespace Database\Seeders;

use App\Models\Ikk;
use App\Models\Iku;
use Illuminate\Database\Seeder;

class IkuSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // IKU 1
        $iku1 = Iku::create(['nama_iku' => 'IKU 1: Angka Efisiensi Edukasi Perguruan Tinggi']);
        Ikk::insert([
            ['id_iku' => $iku1->id_iku, 'nama_ikk' => 'Tingkat keberhasilan mahasiswa menyelesaikan studi tepat waktu sesuai masa studi standar, dibandingkan dengan total mahasiswa yang masuk pada periode tertentu', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 2
        $iku2 = Iku::create(['nama_iku' => 'IKU 2: Persentase Lulusan Pendidikan Tinggi dan Vokasi yang Langsung Bekerja/Melanjutkan Jenjang Pendidikan Berikutnya/ Berwirausaha dalam Jangka Waktu 1 Tahun Setelah Kelulusan']);
        Ikk::insert([
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'Persentase lulusan pendidikan tinggi (akademik, vokasi, dan profesi) yang memiliki aktivitas produktif berupa bekerja', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'Persentase lulusan pendidikan tinggi (akademik, vokasi, dan profesi) yang memiliki aktivitas produktif berupa melanjutkan studi ke jenjang lebih tinggi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'Persentase lulusan pendidikan tinggi (akademik, vokasi, dan profesi) yang memiliki aktivitas produktif berupa berwirausaha dalam jangka waktu maksimal 12 bulan setelah kelulusan', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 3
        $iku3 = Iku::create(['nama_iku' => 'IKU 3: Persentase Mahasiswa S1 dan D4/D3/D2/D1 Berkegiatan/Meraih Prestasi di Luar Program Studi']);
        Ikk::insert([
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'Pertukaran Pelajar', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'Penelitian atau Riset', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'Program Mahasiswa Berdampak', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 4
        $iku4 = Iku::create(['nama_iku' => 'IKU 4: Jumlah Dosen Perguruan Tinggi yang Mendapatkan Rekognisi Internasional']);
        Ikk::insert([
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Tulis Ilmiah: Jurnal ilmiah, buku akademik, dan chapter dalam buku akademik', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Tulis Ilmiah: Karya rujukan: Handbook, guidelines, manual, textbook, monograf, ensiklopedia, kamus', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Tulis Ilmiah: Studi Kasus', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Tulis Ilmiah: Laporan penelitian untuk mitra', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Terapan: Produk fisik, digital, dan algoritme (termasuk prototipe)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Terapan: Pengembangan invensi dengan mitra', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Seni: Visual, audio, audio-visual, pertunjukan (performance)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Seni: Desain konsep Desain produk, desain komunikasi visual, desain arsitektur, desain kriya', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'Karya Seni: Karya preservasi Contoh: modernisasi seni tari daerah', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 5
        $iku5 = Iku::create(['nama_iku' => 'IKU 5: Rasio Luaran Hasil Kerjasama Antara Perguruan Tinggi dan Start-Up/Industri/Lembaga']);
        Ikk::insert([
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Karya Tulis Ilmiah: Jurnal ilmiah, buku akademik, dan chapter dalam buku akademik hasil karya kolaborasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Karya Tulis Ilmiah: Karya rujukan kolaborasi: Handbook, guidelines, manual, textbook, monograf, ensiklopedia, kamus', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Karya Tulis Ilmiah: Studi Kasus Kolaborasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Karya Terapan: Produk fisik, digital, dan algoritme (termasuk prototipe) hasil kolaborasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Karya Terapan: Pengembangan invensi dengan mitra', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'Karya Seni: Visual, audio, audio- visual, pertunjukan (performance) hasil kolaborasi', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 6
        $iku6 = Iku::create(['nama_iku' => 'IKU 6: Persentase Publikasi Bereputasi Internasional (Scopus/WoS)']);
        Ikk::insert([
            ['id_iku' => $iku6->id_iku, 'nama_ikk' => 'Publikasi hasil riset perguruan tinggi yang terindeks pada basis data internasional bereputasi (Scopus dan/atau Web of Science)', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 7
        $iku7 = Iku::create(['nama_iku' => 'IKU 7: Persentase Keterlibatan Perguruan Tinggi dalam SDG1, SDG4, SDG17, dan 2 SDGs Lain Sesuai Keunggulan']);
        Ikk::insert([
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'Pendidikan: kurikulum, matakuliah, modul, atau program literasi yang terintegrasi dengan SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'Penelitian: proyek riset, publikasi, atau produk inovasi yang secara langsung mendukung target SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'Pengabdian kepada Masyarakat (PkM): program pemberdayaan masyarakat, KKN tematik, pelatihan, atau layanan yang berkontribusi pada SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'KerjaSama dan Kemitraan: kolaborasi dengan pemerintah, industri, lembaga internasional, atau komunitas yang mendukung pencapaian SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'Inisiatif Institusional: kebijakan internal perguruan tinggi yang berorientasi pada SDGs', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 8
        $iku8 = Iku::create(['nama_iku' => 'IKU 8: Jumlah SDM Perguruan Tinggi (Dosen/Peneliti) yang Terlibat Langsung dalam Penyusunan Kebijakan (Nasional/Daerah/Industri)']);
        Ikk::insert([
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'Anggota tim penyusun kebijakan nasional/daerah/industri', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'Narasumber resmi atau ahli yang diminta memberikan masukan tertulis dalam proses penyusunan kebijakan', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'Kontributor yang hasil kajian/risetnya dimasukkan dalam dokumen kebijakan resmi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'Saksi Ahli dalam pengadilan (PTUN, MK, MA, PN, Pengadilan Tipikor, Pengadilan Hubungan Industrial, Pengadilan Lingkungan/Perdata)', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 9
        $iku9 = Iku::create(['nama_iku' => 'IKU 9: Persentase Pendapatan Non Pendidikan/UKT']);
        Ikk::insert([
            ['id_iku' => $iku9->id_iku, 'nama_ikk' => 'Pendapatan dari riset dan inovasi: hibah riset nasional/internasional, kontrak riset dengan industri, royalti dari paten/hak cipta/teknologi tepat guna, hasil komersialisasi inovasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku9->id_iku, 'nama_ikk' => 'Pendapatan dari kerja sama dan layanan: jasa konsultasi, pelatihan/sertifikasi profesi, kerja sama internasional, layanan profesional', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku9->id_iku, 'nama_ikk' => 'Pendapatan dari usaha dan unit bisnis perguruan tinggi: hasil pengelolaan aset produktif, usaha komersial, dan unit bisnis lain yang sah', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 10
        $iku10 = Iku::create(['nama_iku' => 'IKU 10: Jumlah Usulan Zona Integritas – WBK/WBBM']);
        Ikk::insert([
            ['id_iku' => $iku10->id_iku, 'nama_ikk' => 'WBK (Wilayah Bebas dari Korupsi): unit kerja yang berkomitmen mewujudkan lingkungan bebas korupsi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku10->id_iku, 'nama_ikk' => 'WBBM (Wilayah Birokrasi Bersih Melayani): unit kerja dengan kualitas pelayanan publik prima dan berintegritas', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 11
        $iku11 = Iku::create(['nama_iku' => 'IKU 11: Opini WTP Atas Laporan Keuangan Perguruan Tinggi']);
        Ikk::insert([
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'Peningkatan kualitas forum koordinasi (tepat waktu, efektif, produktf sesuai goals agenda)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'WDP (Wajar Dengan Pengecualian): dinilai capaian parsial (11.02)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'WDP (Wajar Dengan Pengecualian): dinilai capaian parsial (11.03)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'Predikat SAKIP Perguruan Tinggi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'Jumlah Laporan Pelanggaran Integritas Akademik', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 12
        $iku12 = Iku::create(['nama_iku' => 'IKU 12: Value Keislaman']);
        Ikk::insert([
            ['id_iku' => $iku12->id_iku, 'nama_ikk' => 'Akhlakul Karimah', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}