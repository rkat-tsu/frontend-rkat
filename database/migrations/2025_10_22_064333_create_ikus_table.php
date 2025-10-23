<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ikus', function (Blueprint $table) {
            $table->id('id_iku');
            $table->string('nama_iku', 255);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('ikus');
    }
};