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
        Schema::create('pencairan_danas', function (Blueprint $table) {
            $table->id('id_pencairan');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('id_header');
            $table->unsignedBigInteger('diajukan_oleh');
            $table->enum('status_pencairan', [
                'Draft', 
                'Menunggu_BAAK',
                'Menunggu_Unit_Menaungi',
                'Menunggu_BAUK',
                'Menunggu_WR2',
                'Disetujui_Final',
                'Revisi',
                'Ditolak'
            ])->default('Draft');
            $table->text('catatan')->nullable();
            $table->dateTime('tanggal_pengajuan')->nullable();
            $table->dateTime('tanggal_divalidasi_baak')->nullable();
            $table->dateTime('tanggal_diketahui_unit')->nullable();
            $table->dateTime('tanggal_diverifikasi_bauk')->nullable();
            $table->dateTime('tanggal_disetujui_wr2')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_header')->references('id_header')->on('rkat_headers')->onDelete('cascade');
            $table->foreign('diajukan_oleh')->references('id_user')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pencairan_danas');
    }
};
