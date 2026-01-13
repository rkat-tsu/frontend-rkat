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
        // 1. Tabel Tahun Anggaran
        if (!Schema::hasTable('tahun_anggarans')) {
            Schema::create('tahun_anggarans', function (Blueprint $table) {
                $table->id('id_tahun'); 
                $table->year('tahun_anggaran')->unique();
                $table->date('tanggal_mulai');
                $table->date('tanggal_akhir');
                $table->enum('status_rkat', ['Drafting', 'Submission', 'Approved', 'Closed'])->default('Drafting');
                $table->timestamps();
            });
        }

        // 2. Tabel Unit (Cek dulu apakah sudah ada)
        if (!Schema::hasTable('unit')) {
            Schema::create('unit', function (Blueprint $table) {
                $table->id('id_unit');
                $table->string('kode_unit', 20)->unique(); 
                $table->string('nama_unit', 100);
                $table->enum('tipe_unit', ['Fakultas', 'Prodi', 'Unit', 'Lainnya', 'Atasan', 'Admin']);
                $table->enum('jalur_persetujuan', ['akademik', 'non-akademik'])->default('akademik');
                
                $table->unsignedBigInteger('parent_id')->nullable();
                $table->foreign('parent_id')->references('id_unit')->on('unit')->onDelete('set null');

                $table->unsignedBigInteger('id_kepala')->nullable();
                
                $table->string('no_telepon', 20)->nullable();
                $table->string('email', 100)->nullable();
                $table->timestamps();
            });
        }

        // 3. Tabel Rincian Anggaran
        if (!Schema::hasTable('rincian_anggarans')) {
            Schema::create('rincian_anggarans', function (Blueprint $table) {
                $table->id('id_rincian_anggaran');
                $table->string('kode_anggaran', 20)->unique(); 
                $table->string('nama_anggaran', 150);
                $table->string('kelompok_anggaran', 50)->nullable(); 
                $table->decimal('pagu_limit', 15, 2)->nullable();
                $table->timestamps();
            });
        }

        // 4. Tabel IKU
        if (!Schema::hasTable('ikus')) {
            Schema::create('ikus', function (Blueprint $table) {
                $table->id('id_iku');
                $table->string('nama_iku'); 
                $table->timestamps();
            });
        }

        // 5. Tabel IKK
        if (!Schema::hasTable('ikks')) {
            Schema::create('ikks', function (Blueprint $table) {
                $table->id('id_ikk');
                
                $table->unsignedBigInteger('id_iku');
                $table->foreign('id_iku')->references('id_iku')->on('ikus')->onDelete('cascade');
                
                $table->string('nama_ikk'); 
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ikks');
        Schema::dropIfExists('ikus');
        Schema::dropIfExists('rincian_anggarans');
        Schema::dropIfExists('unit');
        Schema::dropIfExists('tahun_anggarans');
    }
};