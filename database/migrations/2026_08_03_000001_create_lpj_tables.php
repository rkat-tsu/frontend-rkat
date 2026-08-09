<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lpjs', function (Blueprint $table) {
            $table->id('id_lpj');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('id_pencairan');
            $table->string('nomor_lpj', 100)->unique();
            $table->string('judul_lpj');
            $table->date('tanggal_lpj');
            $table->date('tanggal_pelaksanaan_mulai')->nullable();
            $table->date('tanggal_pelaksanaan_selesai')->nullable();
            $table->string('lokasi_kegiatan')->nullable();
            $table->text('ringkasan_kegiatan')->nullable();
            
            $table->decimal('total_pencairan', 15, 2)->default(0);
            $table->decimal('total_realisasi', 15, 2)->default(0);
            $table->decimal('sisa_dana', 15, 2)->default(0); // Positif = Sisa Pengembalian, Negatif = Defisit
            
            $table->string('status_lpj', 100)->default('Draft');
            $table->text('catatan')->nullable();
            $table->json('dokumen_bukti')->nullable(); // link / nama file bukti kwitansi / laporan

            $table->unsignedBigInteger('diajukan_oleh');
            $table->datetime('tanggal_pengajuan')->nullable();
            
            $table->unsignedBigInteger('disetujui_oleh')->nullable();
            $table->datetime('tanggal_persetujuan')->nullable();
            
            $table->timestamps();

            $table->foreign('id_pencairan')->references('id_pencairan')->on('pencairan_danas')->onDelete('cascade');
            $table->foreign('diajukan_oleh')->references('id_user')->on('users')->onDelete('cascade');
            $table->foreign('disetujui_oleh')->references('id_user')->on('users')->onDelete('set null');
        });

        Schema::create('lpj_items', function (Blueprint $table) {
            $table->id('id_lpj_item');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('id_lpj');
            $table->unsignedBigInteger('id_pencairan_item');
            
            $table->decimal('volume_realisasi', 10, 2)->default(0);
            $table->decimal('harga_satuan_realisasi', 15, 2)->default(0);
            $table->decimal('sub_total_realisasi', 15, 2)->default(0);
            $table->decimal('selisih', 15, 2)->default(0); // Subtotal Pencairan - Subtotal Realisasi
            
            $table->string('nomor_kwitansi')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();

            $table->foreign('id_lpj')->references('id_lpj')->on('lpjs')->onDelete('cascade');
            $table->foreign('id_pencairan_item')->references('id_pencairan_item')->on('pencairan_dana_items')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lpj_items');
        Schema::dropIfExists('lpjs');
    }
};
