<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penggunas', function (Blueprint $table) {
            $table->id('id_pengguna');
            $table->string('username', 50)->unique();
            $table->string('password', 255);
            $table->string('nama_lengkap', 100);
            
            // UPDATE: Role disesuaikan dengan alur persetujuan baru
            $table->enum('peran', [
                'Inputer_Prodi', 'Inputer_Unit', 
                'Kaprodi', 'Kepala_Biro', 'Kepala_BPUK', 
                'Dekan', 
                'WR_1', 'WR_2', 'WR_3', 
                'Rektor', 'Admin'
            ]);

            // FK ke Departemen akan ditambahkan setelah Departemen dibuat
            $table->unsignedBigInteger('id_departemen')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('penggunas');
    }
};