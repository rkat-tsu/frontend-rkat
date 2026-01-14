<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabel RKAT Header (Dokumen Utama)
        Schema::create('rkat_headers', function (Blueprint $table) {
            $table->id('id_header');
            
            // Relasi logis ke tahun_anggarans
            $table->year('tahun_anggaran'); 
            
            $table->unsignedBigInteger('id_unit');
            $table->foreign('id_unit')->references('id_unit')->on('unit')->onDelete('cascade');
            
            $table->unsignedBigInteger('diajukan_oleh'); 
            $table->foreign('diajukan_oleh')->references('id_user')->on('users'); 

            $table->string('nomor_dokumen', 50)->unique(); 
            
            $table->enum('status_persetujuan', [
                'Draft', 
                'Diajukan', 
                'Menunggu_Dekan_Kepala',
                'Revisi', 
                'Ditolak', 
                'Disetujui_L1',
                'Menunggu_WR1', 'Menunggu_WR2', 'Menunggu_WR3',
                'Disetujui_WR1', 'Disetujui_WR2', 'Disetujui_WR3',
                'Disetujui_Final'
            ])->default('Draft');
            
            $table->datetime('tanggal_pengajuan')->nullable();
            $table->text('catatan_revisi')->nullable();
            $table->decimal('total_anggaran', 15, 2)->default(0);
            
            $table->timestamps();
        });

        // 2. Tabel RKAT Detail (Kegiatan)
        Schema::create('rkat_details', function (Blueprint $table) {
            $table->id('id_rkat_detail');
            
            $table->unsignedBigInteger('id_header');
            $table->foreign('id_header')->references('id_header')->on('rkat_headers')->onDelete('cascade');
            
            $table->string('judul_kegiatan');
            $table->text('deskripsi_kegiatan');
            
            $table->unsignedBigInteger('id_iku')->nullable();
            $table->foreign('id_iku')->references('id_iku')->on('ikus');
            
            $table->unsignedBigInteger('id_ikk')->nullable();
            $table->foreign('id_ikk')->references('id_ikk')->on('ikks');

            // Data Isian Lengkap
            $table->text('latar_belakang')->nullable();
            $table->text('rasional')->nullable();
            $table->text('tujuan')->nullable();
            $table->text('mekanisme')->nullable();
            
            $table->date('jadwal_pelaksanaan_mulai')->nullable();
            $table->date('jadwal_pelaksanaan_akhir')->nullable();
            $table->string('lokasi_pelaksanaan')->nullable();
            
            // Output Sederhana
            $table->string('target')->nullable(); 
            $table->string('pjawab')->nullable(); 
            
            $table->enum('jenis_kegiatan', ['Rutin', 'Inovasi'])->default('Rutin');
            
            $table->decimal('anggaran', 15, 2)->default(0);

            // Metode Pencairan
            $table->enum('jenis_pencairan', ['Tunai', 'Bank'])->default('Tunai');
            $table->string('nama_bank')->nullable();
            $table->string('nomor_rekening')->nullable();
            $table->string('atas_nama')->nullable();

            $table->timestamps();
        });

        // 3. Tabel Indikator Keberhasilan (Multi-row per Kegiatan)
        Schema::create('indikator_keberhasilans', function (Blueprint $table) {
            $table->id('id_indikator');
            
            $table->unsignedBigInteger('id_rkat_detail');
            $table->foreign('id_rkat_detail')->references('id_rkat_detail')->on('rkat_details')->onDelete('cascade');
            
            $table->string('nama_indikator');
            
            // Kolom Target & Capaian
            $table->string('capai_2024')->nullable();
            $table->string('target_2025')->nullable();
            $table->string('capai_2025')->nullable();
            $table->string('target_2029')->nullable();
            $table->string('capai_2029')->nullable(); 

            $table->timestamps();
        });

        // 4. Tabel RAB Item (Rincian Biaya)
        Schema::create('rkat_rab_items', function (Blueprint $table) {
            $table->id('id');
            
            $table->unsignedBigInteger('id_rkat_detail');
            $table->foreign('id_rkat_detail')->references('id_rkat_detail')->on('rkat_details')->onDelete('cascade');
            
            $table->string('kode_anggaran')->nullable(); 
            $table->string('deskripsi_item'); 
            
            $table->decimal('volume', 10, 2);
            $table->string('satuan', 50); 
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('sub_total', 15, 2);
            
            $table->timestamps();
        });

        // 5. Tabel Log Persetujuan
        Schema::create('log_persetujuans', function (Blueprint $table) {
            $table->id('id_log');
            
            $table->unsignedBigInteger('id_header');
            $table->foreign('id_header')->references('id_header')->on('rkat_headers')->onDelete('cascade');
            
            $table->unsignedBigInteger('id_approver');
            $table->foreign('id_approver')->references('id_user')->on('users');
            
            $table->string('level_persetujuan'); 
            $table->enum('aksi', ['Setuju', 'Tolak', 'Revisi']);
            $table->text('catatan')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_persetujuans');
        Schema::dropIfExists('rkat_rab_items');
        Schema::dropIfExists('indikator_keberhasilans');
        Schema::dropIfExists('rkat_details');
        Schema::dropIfExists('rkat_headers');
    }
};