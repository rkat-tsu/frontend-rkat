<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Table Karyawan / SDM
        if (!Schema::hasTable('karyawans')) {
            Schema::create('karyawans', function (Blueprint $table) {
                $table->id('id_karyawan');
                $table->uuid('uuid')->unique()->nullable();
                $table->string('nik', 50)->nullable()->index();
                $table->string('nama', 150);
                $table->string('email', 150)->nullable();
                $table->string('no_telepon', 30)->nullable();
                $table->unsignedBigInteger('id_unit')->nullable();
                $table->foreign('id_unit')->references('id_unit')->on('unit')->onDelete('set null');
                $table->string('jabatan', 100)->nullable();
                $table->string('status_pegawai', 50)->default('Tetap');
                $table->boolean('is_aktif')->default(true);
                $table->timestamps();
            });
        }

        // 2. Table Percakapan Dua Arah / Catatan Revisi RKA
        if (!Schema::hasTable('rkat_komentars')) {
            Schema::create('rkat_komentars', function (Blueprint $table) {
                $table->id('id_komentar');
                $table->uuid('uuid')->unique()->nullable();
                $table->unsignedBigInteger('id_header');
                $table->foreign('id_header')->references('id_header')->on('rkat_headers')->onDelete('cascade');
                $table->unsignedBigInteger('id_user');
                $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
                $table->text('pesan');
                $table->string('lampiran_path')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rkat_komentars');
        Schema::dropIfExists('karyawans');
    }
};
