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
        Schema::create('iku_change_logs', function (Blueprint $table) {
            $table->id('id_log');
            $table->uuid('uuid')->unique()->nullable();
            $table->unsignedBigInteger('id_iku')->nullable();
            $table->unsignedBigInteger('id_user')->nullable();
            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('set null');
            $table->year('tahun_anggaran')->nullable();
            $table->string('tipe_entitas', 50)->default('IKU'); // IKU, IKK, IKU_IKK
            $table->string('aksi', 50); // CREATE, UPDATE, DELETE, BULK_CREATE, COPY_YEAR, SYNC_IKK
            $table->string('nama_entitas', 500)->nullable();
            $table->text('ringkasan_perubahan');
            $table->json('detail_perubahan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iku_change_logs');
    }
};
