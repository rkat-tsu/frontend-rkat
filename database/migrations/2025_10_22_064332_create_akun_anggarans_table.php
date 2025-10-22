<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('akun_anggarans', function (Blueprint $table) {
            $table->string('kode_akun', 20)->primary();
            $table->string('nama_akun', 150);
            $table->string('kelompok_akun', 50)->nullable();
            $table->decimal('pagu_limit', 18, 2)->default(0.00);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('akun_anggarans');
    }
};