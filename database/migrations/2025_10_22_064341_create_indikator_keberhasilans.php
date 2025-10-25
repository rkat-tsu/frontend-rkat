<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('indikator_keberhasilans', function (Blueprint $table) {
            $table->id('id_indikator'); 

            $table->text('capai_2024')->nullable();
            $table->text('capai_2025')->nullable();
            $table->text('capai_2029')->nullable();

            $table->text('target_2025')->nullable();
            $table->text('target_2029')->nullable();
            
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('indikator_keberhasilans');
    }
};