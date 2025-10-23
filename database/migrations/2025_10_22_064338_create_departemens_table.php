<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departemens', function (Blueprint $table) {
            $table->id('id_departemen');
            $table->string('kode_departemen', 10)->unique();
            $table->string('nama_departemen', 100);
            $table->enum('tipe', ['Akademik', 'Non_Akademik'])->default('Akademik'); 
            
            // Foreign Keys
            $table->foreignId('id_fakultas')->nullable()->constrained('fakultas', 'id_fakultas');
            $table->foreignId('id_kepala')->nullable()->constrained('users', 'id_user');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('departemens');
    }
};