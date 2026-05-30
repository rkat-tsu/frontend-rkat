<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tahun_anggarans', function (Blueprint $table) {
            $table->id('id_tahun'); 
            $table->uuid('uuid')->unique()->nullable();
            $table->year('tahun_anggaran')->unique();
            $table->date('tanggal_mulai');
            $table->date('tanggal_akhir');
            $table->enum('status_rkat', ['Drafting', 'Submission', 'Approved', 'Closed'])->default('Drafting');
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('rincian_anggarans', function (Blueprint $table) {
            $table->id('id_rincian_anggaran');
            $table->uuid('uuid')->unique()->nullable();
            $table->string('kode_anggaran', 20)->unique(); 
            $table->string('nama_anggaran', 150);
            $table->string('satuan', 50)->nullable();
            $table->decimal('nominal', 15, 2)->default(0);
            $table->string('kelompok_anggaran', 50)->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('ikus', function (Blueprint $table) {
            $table->id('id_iku');
            $table->uuid('uuid')->unique()->nullable();
            $table->string('nama_iku'); 
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('ikks', function (Blueprint $table) {
            $table->id('id_ikk');
            $table->uuid('uuid')->unique()->nullable();
            $table->unsignedBigInteger('id_iku');
            $table->foreign('id_iku')->references('id_iku')->on('ikus')->onDelete('cascade');
            $table->string('nama_ikk'); 
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ikks');
        Schema::dropIfExists('ikus');
        Schema::dropIfExists('rincian_anggarans');
        Schema::dropIfExists('tahun_anggarans');
    }
};