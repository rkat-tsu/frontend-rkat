<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tahun_anggarans', function (Blueprint $table) {
            $table->integer('tahun_anggaran')->primary();
            $table->date('tanggal_mulai');
            $table->date('tanggal_akhir');
            $table->enum('status_rkat', ['Drafting', 'Submission', 'Approved', 'Closed'])->default('Drafting');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('tahun_anggarans');
    }
};