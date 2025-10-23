<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ikusubs', function (Blueprint $table) {
            $table->id('id_ikusub');
            $table->string('nama_ikusub', 255);
            $table->foreignId('id_iku')->constrained('ikus', 'id_iku')->onDelete('cascade');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('ikusubs');
    }
};