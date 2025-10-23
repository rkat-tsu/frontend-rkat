<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rkat_details', function (Blueprint $table) {
            $table->id('id_rkat_detail'); 
            
            // FK KRUSIAL: Menghubungkan ke RKAT_HEADER
            $table->foreignId('id_header')->constrained('rkat_headers', 'id_header')->onDelete('cascade');
            
            // Foreign Keys Item
            $table->string('kode_akun', 20);
            $table->foreign('kode_akun')->references('kode_akun')->on('akun_anggarans');
            $table->foreignId('id_program')->constrained('program_kerjas', 'id_proker');

            // Detail Program Per Baris
            $table->text('deskripsi_kegiatan');
            $table->text('latar_belakang')->nullable();
            $table->text('rasional')->nullable();
            $table->text('tujuan')->nullable();
            $table->text('mekanisme')->nullable();
            $table->text('indikator_keberhasilan')->nullable();

            // RAB
            $table->text('target')->nullable();
            $table->enum('kegiatan', ['Rutin', 'Inovasi'])->default('Rutin');
            $table->json('dokumen_pendukung')->nullable(); // PR

            $table->date('waktu_pelaksanaan')->nullable();
            $table->decimal('anggaran', 15, 2);
            $table->enum('jenis_pencairan', ['Bank', 'Tunai'])->default('Tunai');
            $table->string('nama_bank')->nullable();
            $table->string('nomor_rekening')->nullable();
            $table->string('atas_nama')->nullable();
            
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('rkat_details');
    }
};