<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fakultas', function (Blueprint $table) {
            $table->id('id_fakultas');
            $table->string('nama_fakultas', 100);
            
            // FK ke Pengguna (Dekan)
            $table->foreignId('id_dekan')->nullable()->constrained('users', 'id_user'); 
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('fakultas');
    }
};