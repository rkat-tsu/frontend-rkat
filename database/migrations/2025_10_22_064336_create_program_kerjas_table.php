<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_kerjas', function (Blueprint $table) {
            $table->id('id_proker');
            $table->string('kode_proker', 10)->unique();
            $table->string('nama_proker', 255);
            $table->foreignId('id_ikk')->constrained('ikks', 'id_ikk')->onDelete('cascade');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('program_kerjas');
    }
};