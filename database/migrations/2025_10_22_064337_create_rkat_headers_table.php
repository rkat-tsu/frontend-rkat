<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; // Diperlukan untuk DB::raw()

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rkat_headers', function (Blueprint $table) {
            $table->id('id_header'); 
            
            // Perbaikan FK: Menggunakan $table->integer() dan foreign() manual
            $table->integer('tahun_anggaran'); 
            $table->foreign('tahun_anggaran')->references('tahun_anggaran')->on('tahun_anggarans');

            $table->foreignId('id_departemen')->constrained('departemens', 'id_departemen');
            $table->foreignId('diajukan_oleh')->constrained('penggunas', 'id_pengguna');

            $table->string('nomor_dokumen', 50)->unique()->nullable();
            $table->text('judul_pengajuan')->nullable(); 

            $table->enum('status_persetujuan', [
                'Draft', 'Diajukan', 'Revisi', 
                'Disetujui_L1', 'Menunggu_Dekan_BPUK', 
                'Menunggu_WR1', 'Menunggu_WR3', 'Menunggu_WR2', 
                'Disetujui_Final', 'Ditolak'
            ])->default('Draft');
            
            $table->dateTime('tanggal_pengajuan')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('rkat_headers');
    }
};