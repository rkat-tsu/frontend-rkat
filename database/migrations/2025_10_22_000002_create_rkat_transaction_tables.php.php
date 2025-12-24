<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rkat_headers', function (Blueprint $table) {
            $table->id('id_header');
            $table->integer('tahun_anggaran');
            $table->foreignId('id_unit')->constrained('unit', 'id_unit');
            $table->foreignId('diajukan_oleh')->constrained('users', 'id_user');
            $table->string('nomor_dokumen', 50)->unique()->nullable();
            $table->enum('status_persetujuan', [
                'Draft', 'Diajukan', 'Revisi', 'Disetujui_L1', 'Menunggu_Dekan_Kepala',
                'Menunggu_WR1', 'Menunggu_WR3', 'Menunggu_WR2', 'Disetujui_WR1',
                'Disetujui_WR2', 'Disetujui_WR3', 'Disetujui_Final', 'Ditolak',
            ])->default('Draft')->index('idx_rkat_status'); // Indeks ditambahkan
            $table->dateTime('tanggal_pengajuan')->default(DB::raw('CURRENT_TIMESTAMP'))->index('idx_rkat_tgl');
            $table->timestamps();

            $table->foreign('tahun_anggaran')->references('tahun_anggaran')->on('tahun_anggarans');
        });

        Schema::create('rkat_details', function (Blueprint $table) {
            $table->id('id_rkat_detail');
            $table->foreignId('id_header')->constrained('rkat_headers', 'id_header')->onDelete('cascade');

            $table->string('judul_kegiatan', 500);
            $table->foreignId('id_iku')->nullable()->constrained('ikus', 'id_iku')->onDelete('set null');
            $table->foreignId('id_ikusub')->nullable()->constrained('ikusubs', 'id_ikusub')->onDelete('set null');
            $table->foreignId('id_ikk')->nullable()->constrained('ikks', 'id_ikk')->onDelete('set null');

            $table->string('kode_akun', 20);
            $table->foreign('kode_akun')->references('kode_anggaran')->on('rincian_anggarans');
            $table->foreignId('id_indikator')->constrained('indikator_keberhasilans', 'id_indikator');

            $table->text('deskripsi_kegiatan');
            $table->text('latar_belakang');
            $table->date('jadwal_pelaksanaan_mulai');
            $table->date('jadwal_pelaksanaan_akhir');
            $table->decimal('anggaran', 15, 2);
            $table->timestamps();
        });

        Schema::create('rkat_rab_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_rkat_detail')->constrained('rkat_details', 'id_rkat_detail')->onDelete('cascade');
            $table->string('kode_anggaran', 20)->index('idx_rab_kode'); // Indeks ditambahkan
            $table->text('deskripsi_item');
            $table->decimal('volume', 8, 2);
            $table->string('satuan', 50);
            $table->decimal('harga_satuan', 18, 2);
            $table->decimal('sub_total', 18, 2);
            $table->timestamps();
        });

        Schema::create('log_persetujuans', function (Blueprint $table) {
            $table->id('id_log');
            $table->foreignId('id_header')->constrained('rkat_headers', 'id_header')->onDelete('cascade');
            $table->foreignId('id_approver')->constrained('users', 'id_user')->index('idx_log_approver'); // Indeks ditambahkan
            $table->string('level_persetujuan', 50)->index('idx_log_level'); // Indeks ditambahkan
            $table->enum('aksi', ['Review', 'Setuju', 'Revisi', 'Tolak']);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_persetujuans');
        Schema::dropIfExists('rkat_rab_items');
        Schema::dropIfExists('rkat_details');
        Schema::dropIfExists('rkat_headers');
    }
};
