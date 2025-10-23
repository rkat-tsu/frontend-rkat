<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ikks', function (Blueprint $table) {
            $table->id('id_ikk');
            $table->string('nama_ikk', 255);
            $table->foreignId('id_ikusub')->constrained('ikusubs', 'id_ikusub')->onDelete('cascade');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('ikks');
    }
};