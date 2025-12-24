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
        Schema::create('tahun_anggarans', function (Blueprint $table) {
            $table->integer('tahun_anggaran')->primary();
            $table->date('tanggal_mulai');
            $table->date('tanggal_akhir');
            $table->enum('status_rkat', ['Drafting', 'Submission', 'Approved', 'Closed'])->default('Drafting');
            $table->timestamps();
        });

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

        Schema::create('rincian_anggarans', function (Blueprint $table) {
            $table->string('kode_anggaran', 20)->primary();
            $table->string('nama_anggaran', 150);
            $table->string('kelompok_anggaran', 50)->nullable();
            $table->decimal('pagu_limit', 18, 2)->default(0.00);
            $table->timestamps();
        });

        Schema::create('indikator_keberhasilans', function (Blueprint $table) {
            $table->id('id_indikator');
            $table->text('nama_indikator')->nullable();
            $table->text('capai_2024')->nullable();
            $table->text('capai_2025')->nullable();
            $table->text('target_2025')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tahun_anggarans');
        Schema::dropIfExists('ikus');
        Schema::dropIfExists('ikusubs');
        Schema::dropIfExists('ikks');
        Schema::dropIfExists('rincian_anggarans');
        Schema::dropIfExists('indikator_keberhasilans');
    }
};
