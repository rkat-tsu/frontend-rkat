<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema; // Diperlukan untuk DB::raw()

return new class extends Migration
{
    public function up(): void
    {
        // =======================================================
        // 1. MASTER DATA UTAMA (Harus dibuat duluan)
        // =======================================================

        // Tabel Tahun Anggaran (Parent untuk RKAT Header)
        Schema::create('tahun_anggarans', function (Blueprint $table) {
            $table->integer('tahun_anggaran')->primary();
            $table->date('tanggal_mulai');
            $table->date('tanggal_akhir');
            $table->enum('status_rkat', ['Drafting', 'Submission', 'Approved', 'Closed'])->default('Drafting');
            $table->timestamps();
        });

        // Tabel Indikator Kinerja Utama (Parent dari Program Kerja)
        Schema::create('ikus', function (Blueprint $table) {
            $table->id('id_iku');
            $table->string('nama_iku', 255);
            $table->timestamps();
        });

        Schema::create('ikusubs', function (Blueprint $table) {
            $table->id('id_ikusub');
            $table->string('nama_ikusub', 255);
            $table->foreignId('id_iku')->constrained('ikus', 'id_iku')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('ikks', function (Blueprint $table) {
            $table->id('id_ikk');
            $table->string('nama_ikk', 255);
            $table->foreignId('id_ikusub')->constrained('ikusubs', 'id_ikusub')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('program_kerjas', function (Blueprint $table) {
            $table->id('id_proker');
            $table->string('kode_proker', 10)->unique();
            $table->text('nama_proker');
            $table->foreignId('id_ikk')->constrained('ikks', 'id_ikk')->onDelete('cascade');
            $table->timestamps();
        });

        // Tabel Akun Anggaran Master (Parent untuk RKAT Detail)
        Schema::create('rincian_anggarans', function (Blueprint $table) {
            // Kolom transaksional (volume, harga) dihapus, karena tidak cocok di master data
            $table->string('kode_anggaran', 20)->primary();
            $table->string('nama_anggaran', 150);
            $table->string('kelompok_anggaran', 50)->nullable();
            $table->decimal('pagu_limit', 18, 2)->default(0.00);
            $table->timestamps();
        });

        // Tabel Indikator Keberhasilan
        Schema::create('indikator_keberhasilans', function (Blueprint $table) {
            $table->id('id_indikator');
            $table->text('nama_indikator')->nullable();
            // Kolom target tahunan (dipertahankan sesuai permintaan, tapi kaku)
            $table->text('capai_2024')->nullable();
            $table->text('capai_2025')->nullable();
            $table->text('capai_2029')->nullable();
            $table->text('target_2025')->nullable();
            $table->text('target_2029')->nullable();
            $table->timestamps();
        });

        // =======================================================
        // 2. TRANSAKSI RKAT HEADER (Setelah Tahun Anggaran)
        // =======================================================

        Schema::create('rkat_headers', function (Blueprint $table) {
            $table->id('id_header');

            // FK ke Tahun Anggaran
            $table->integer('tahun_anggaran');
            $table->foreign('tahun_anggaran')->references('tahun_anggaran')->on('tahun_anggarans');

            // Asumsi 'unit' dan 'users' sudah ada
            $table->foreignId('id_unit')->constrained('unit', 'id_unit');
            $table->foreignId('diajukan_oleh')->constrained('users', 'id_user');

            $table->string('nomor_dokumen', 50)->unique()->nullable();

            $table->enum('status_persetujuan', [
                'Draft', 'Diajukan', 'Revisi',
                'Disetujui_L1', 'Menunggu_Dekan_Kepala',
                'Menunggu_WR1', 'Menunggu_WR3', 'Menunggu_WR2',
                'Disetujui_WR1', 'Disetujui_WR2', 'Disetujui_WR3',
                'Disetujui_Final', 'Ditolak',
            ])->default('Draft');

            $table->dateTime('tanggal_pengajuan')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps();
        });

        // =======================================================
        // 3. TRANSAKSI RKAT DETAIL & LOG (Setelah Header & Master)
        // =======================================================

        Schema::create('rkat_details', function (Blueprint $table) {
            $table->id('id_rkat_detail');

            $table->foreignId('id_header')->constrained('rkat_headers', 'id_header')->onDelete('cascade');
            $table->string('kode_akun', 20);
            $table->foreign('kode_akun')->references('kode_anggaran')->on('rincian_anggarans');
            $table->foreignId('id_program')->constrained('program_kerjas', 'id_proker');
            $table->foreignId('id_indikator')->constrained('indikator_keberhasilans', 'id_indikator');

            $table->text('deskripsi_kegiatan');
            $table->text('latar_belakang');
            $table->text('rasional');
            $table->text('tujuan');
            $table->text('mekanisme');
            $table->date('jadwal_pelaksanaan_mulai');
            $table->date('jadwal_pelaksanaan_akhir');
            $table->text('lokasi_pelaksanaan');
            $table->text('targetkegiatan');
            $table->text('keberlanjutan');
            $table->text('pjawab');

            // RAB
            $table->text('target');
            // BARIS DI BAWAH INI DIHAPUS KARENA SALAH/BERLEBIHAN
            // $table->foreign('kegiatan')->references('judul_pengajuan')->on('rkat_headers');
            $table->enum('jenis_kegiatan', ['Rutin', 'Inovasi'])->default('Rutin');
            $table->json('dokumen_pendukung')->nullable();

            $table->decimal('anggaran', 15, 2);
            $table->enum('jenis_pencairan', ['Bank', 'Tunai'])->default('Tunai');
            $table->string('nama_bank')->nullable();
            $table->string('nomor_rekening')->nullable();
            $table->string('atas_nama')->nullable();

            $table->timestamps();
        });

        Schema::create('rkat_rab_items', function (Blueprint $table) {
            $table->id();

            // FK ke baris RKAT Detail (kegiatan/baris anggaran yang dirinci)
            $table->foreignId('id_rkat_detail')->constrained('rkat_details', 'id_rkat_detail')->onDelete('cascade');

            // FK ke master Akun Anggaran (untuk mendapatkan nama akun dan kelompok)
            $table->string('kode_anggaran', 20);
            $table->foreign('kode_anggaran')->references('kode_anggaran')->on('rincian_anggarans');

            // Data RAB Item
            $table->text('deskripsi_item'); // Contoh: "Tiket pesawat" atau "Kertas HVS"
            $table->decimal('volume', 8, 2); // Jumlah (misal: 2.5 atau 100)
            $table->string('satuan', 50);    // Satuan (misal: "Unit", "Kali", "Orang", "Rim")
            $table->decimal('harga_satuan', 18, 2); // Harga per satuan
            $table->decimal('sub_total', 18, 2); // Volume * Harga Satuan

            $table->timestamps();
        });

        Schema::create('log_persetujuans', function (Blueprint $table) {
            $table->id('id_log');

            // FK KRUSIAL: Merujuk ke RKAT_HEADER (Persetujuan per dokumen)
            $table->foreignId('id_header')->constrained('rkat_headers', 'id_header')->onDelete('cascade');
            $table->foreignId('id_approver')->constrained('users', 'id_user');

            $table->string('level_persetujuan', 50);
            $table->enum('aksi', ['Review', 'Setuju', 'Revisi', 'Tolak']);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rkat_headers');
        Schema::dropIfExists('indikator_keberhasilans');
        Schema::dropIfExists('rkat_details');
        Schema::dropIfExists('log_persetujuans');
        Schema::dropIfExists('tahun_anggarans');
        Schema::dropIfExists('ikus');
        Schema::dropIfExists('ikusubs');
        Schema::dropIfExists('ikks');
        Schema::dropIfExists('program_kerjas');
        Schema::dropIfExists('rincian_anggarans');
        Schema::dropIfExists('rkat_rab_items');
    }
};
