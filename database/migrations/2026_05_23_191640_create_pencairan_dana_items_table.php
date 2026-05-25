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
        Schema::create('pencairan_dana_items', function (Blueprint $table) {
            $table->id('id_pencairan_item');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('id_pencairan');
            $table->unsignedBigInteger('id_rkat_rab_item');
            $table->integer('volume_pencairan')->default(0);
            $table->decimal('nominal_pencairan', 15, 2)->default(0);
            $table->decimal('sub_total_pencairan', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('id_pencairan')->references('id_pencairan')->on('pencairan_danas')->onDelete('cascade');
            $table->foreign('id_rkat_rab_item')->references('id')->on('rkat_rab_items')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pencairan_dana_items');
    }
};
