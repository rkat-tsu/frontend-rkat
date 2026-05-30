<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pencairan_danas', function (Blueprint $table) {
            $table->id('id_pencairan');
            $table->uuid('uuid')->unique();
            $table->unsignedBigInteger('id_header');
            $table->unsignedBigInteger('diajukan_oleh');
            
            $table->string('status_pencairan', 100)->default('Draft');
            $table->string('nama_pencairan')->nullable();
            
            $table->unsignedBigInteger('current_step_id')->nullable();
            $table->foreign('current_step_id')->references('id')->on('approval_path_steps')->onDelete('set null');
            
            $table->text('catatan')->nullable();
            $table->dateTime('tanggal_pengajuan')->nullable();
            $table->json('approval_dates')->nullable();
            $table->timestamps();

            $table->foreign('id_header')->references('id_header')->on('rkat_headers')->onDelete('cascade');
            $table->foreign('diajukan_oleh')->references('id_user')->on('users')->onDelete('cascade');
        });

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

    public function down(): void
    {
        Schema::dropIfExists('pencairan_dana_items');
        Schema::dropIfExists('pencairan_danas');
    }
};