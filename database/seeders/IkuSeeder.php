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
        Ikk::query()->insert([
            ['id_iku' => $iku1->id_iku, 'nama_ikk' => 'IKK 1.1: Tingkat keberhasilan mahasiswa menyelesaikan studi tepat waktu sesuai masa studi standar, dibandingkan dengan total mahasiswa yang masuk pada periode tertentu', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 2
        $iku2 = Iku::create(['nama_iku' => 'IKU 2: Persentase Lulusan Pendidikan Tinggi dan Vokasi yang Langsung Bekerja/Melanjutkan Jenjang Pendidikan Berikutnya/ Berwirausaha dalam Jangka Waktu 1 Tahun Setelah Kelulusan']);
        Ikk::query()->insert([
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'IKK 2.1: Persentase lulusan pendidikan tinggi (akademik, vokasi, dan profesi) yang memiliki aktivitas produktif berupa bekerja', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'IKK 2.2: Persentase lulusan pendidikan tinggi (akademik, vokasi, dan profesi) yang memiliki aktivitas produktif berupa melanjutkan studi ke jenjang lebih tinggi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku2->id_iku, 'nama_ikk' => 'IKK 2.3: Persentase lulusan pendidikan tinggi (akademik, vokasi, dan profesi) yang memiliki aktivitas produktif berupa berwirausaha dalam jangka waktu maksimal 12 bulan setelah kelulusan', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 3
        $iku3 = Iku::create(['nama_iku' => 'IKU 3: Persentase Mahasiswa S1 dan D4/D3/D2/D1 Berkegiatan/Meraih Prestasi di Luar Program Studi']);
        Ikk::query()->insert([
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'IKK 3.1: Pertukaran Pelajar', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'IKK 3.2: Penelitian atau Riset', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku3->id_iku, 'nama_ikk' => 'IKK 3.3: Program Mahasiswa Berdampak', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 4
        $iku4 = Iku::create(['nama_iku' => 'IKU 4: Jumlah Dosen Perguruan Tinggi yang Mendapatkan Rekognisi Internasional']);
        Ikk::query()->insert([
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.1: Karya Tulis Ilmiah: Jurnal ilmiah, buku akademik, dan chapter dalam buku akademik', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.2: Karya Tulis Ilmiah: Karya rujukan: Handbook, guidelines, manual, textbook, monograf, ensiklopedia, kamus', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.3: Karya Tulis Ilmiah: Studi Kasus', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.4: Karya Tulis Ilmiah: Laporan penelitian untuk mitra', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.5: Karya Terapan: Produk fisik, digital, dan algoritme (termasuk prototipe)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.6: Karya Terapan: Pengembangan invensi dengan mitra', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.7: Karya Seni: Visual, audio, audio-visual, pertunjukan (performance)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.8: Karya Seni: Desain konsep Desain produk, desain komunikasi visual, desain arsitektur, desain kriya', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku4->id_iku, 'nama_ikk' => 'IKK 4.9: Karya Seni: Karya preservasi Contoh: modernisasi seni tari daerah', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 5
        $iku5 = Iku::create(['nama_iku' => 'IKU 5: Rasio Luaran Hasil Kerjasama Antara Perguruan Tinggi dan Start-Up/Industri/Lembaga']);
        Ikk::query()->insert([
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'IKK 5.1: Karya Tulis Ilmiah: Jurnal ilmiah, buku akademik, dan chapter dalam buku akademik hasil karya kolaborasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'IKK 5.2: Karya Tulis Ilmiah: Karya rujukan kolaborasi: Handbook, guidelines, manual, textbook, monograf, ensiklopedia, kamus', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'IKK 5.3: Karya Tulis Ilmiah: Studi Kasus Kolaborasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'IKK 5.4: Karya Terapan: Produk fisik, digital, dan algoritme (termasuk prototipe) hasil kolaborasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'IKK 5.5: Karya Terapan: Pengembangan invensi dengan mitra', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku5->id_iku, 'nama_ikk' => 'IKK 5.6: Karya Seni: Visual, audio, audio- visual, pertunjukan (performance) hasil kolaborasi', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 6
        $iku6 = Iku::create(['nama_iku' => 'IKU 6: Persentase Publikasi Bereputasi Internasional (Scopus/WoS)']);
        Ikk::query()->insert([
            ['id_iku' => $iku6->id_iku, 'nama_ikk' => 'IKK 6.1: Publikasi hasil riset perguruan tinggi yang terindeks pada basis data internasional bereputasi (Scopus dan/atau Web of Science)', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 7
        $iku7 = Iku::create(['nama_iku' => 'IKU 7: Persentase Keterlibatan Perguruan Tinggi dalam SDG1, SDG4, SDG17, dan 2 SDGs Lain Sesuai Keunggulan']);
        Ikk::query()->insert([
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'IKK 7.1: Pendidikan: kurikulum, matakuliah, modul, atau program literasi yang terintegrasi dengan SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'IKK 7.2: Penelitian: proyek riset, publikasi, atau produk inovasi yang secara langsung mendukung target SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'IKK 7.3: Pengabdian kepada Masyarakat (PkM): program pemberdayaan masyarakat, KKN tematik, pelatihan, atau layanan yang berkontribusi pada SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'IKK 7.4: KerjaSama dan Kemitraan: kolaborasi dengan pemerintah, industri, lembaga internasional, atau komunitas yang mendukung pencapaian SDGs', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku7->id_iku, 'nama_ikk' => 'IKK 7.5: Inisiatif Institusional: kebijakan internal perguruan tinggi yang berorientasi pada SDGs', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 8
        $iku8 = Iku::create(['nama_iku' => 'IKU 8: Jumlah SDM Perguruan Tinggi (Dosen/Peneliti) yang Terlibat Langsung dalam Penyusunan Kebijakan (Nasional/Daerah/Industri)']);
        Ikk::query()->insert([
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'IKK 8.1: Anggota tim penyusun kebijakan nasional/daerah/industri', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'IKK 8.2: Narasumber resmi atau ahli yang diminta memberikan masukan tertulis dalam proses penyusunan kebijakan', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'IKK 8.3: Kontributor yang hasil kajian/risetnya dimasukkan dalam dokumen kebijakan resmi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku8->id_iku, 'nama_ikk' => 'IKK 8.4: Saksi Ahli dalam pengadilan (PTUN, MK, MA, PN, Pengadilan Tipikor, Pengadilan Hubungan Industrial, Pengadilan Lingkungan/Perdata)', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 9
        $iku9 = Iku::create(['nama_iku' => 'IKU 9: Persentase Pendapatan Non Pendidikan/UKT']);
        Ikk::query()->insert([
            ['id_iku' => $iku9->id_iku, 'nama_ikk' => 'IKK 9.1: Pendapatan dari riset dan inovasi: hibah riset nasional/internasional, kontrak riset dengan industri, royalti dari paten/hak cipta/teknologi tepat guna, hasil komersialisasi inovasi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku9->id_iku, 'nama_ikk' => 'IKK 9.2: Pendapatan dari kerja sama dan layanan: jasa konsultasi, pelatihan/sertifikasi profesi, kerja sama internasional, layanan profesional', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku9->id_iku, 'nama_ikk' => 'IKK 9.3: Pendapatan dari usaha dan unit bisnis perguruan tinggi: hasil pengelolaan aset produktif, usaha komersial, dan unit bisnis lain yang sah', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 10
        $iku10 = Iku::create(['nama_iku' => 'IKU 10: Jumlah Usulan Zona Integritas – WBK/WBBM']);
        Ikk::query()->insert([
            ['id_iku' => $iku10->id_iku, 'nama_ikk' => 'IKK 10.1: WBK (Wilayah Bebas dari Korupsi): unit kerja yang berkomitmen mewujudkan lingkungan bebas korupsi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku10->id_iku, 'nama_ikk' => 'IKK 10.2: WBBM (Wilayah Birokrasi Bersih Melayani): unit kerja dengan kualitas pelayanan publik prima dan berintegritas', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 11
        $iku11 = Iku::create(['nama_iku' => 'IKU 11: Opini WTP Atas Laporan Keuangan Perguruan Tinggi']);
        Ikk::query()->insert([
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'IKK 11.1: Peningkatan kualitas forum koordinasi (tepat waktu, efektif, produktf sesuai goals agenda)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'IKK 11.2: WDP (Wajar Dengan Pengecualian): dinilai capaian parsial (11.02)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'IKK 11.3: WDP (Wajar Dengan Pengecualian): dinilai capaian parsial (11.03)', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'IKK 11.4: Predikat SAKIP Perguruan Tinggi', 'created_at' => $now, 'updated_at' => $now],
            ['id_iku' => $iku11->id_iku, 'nama_ikk' => 'IKK 11.5: Jumlah Laporan Pelanggaran Integritas Akademik', 'created_at' => $now, 'updated_at' => $now],
        ]);

        // IKU 12
        $iku12 = Iku::create(['nama_iku' => 'IKU 12: Value Keislaman']);
        Ikk::query()->insert([
            ['id_iku' => $iku12->id_iku, 'nama_ikk' => 'IKK 12.1: Akhlakul Karimah', 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}