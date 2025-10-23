<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_persetujuans', function (Blueprint $table) {
            $table->id('id_log');

            // FK KRUSIAL: Merujuk ke RKAT_HEADER (Persetujuan per dokumen)
            $table->foreignId('id_header')->constrained('rkat_headers', 'id_header')->onDelete('cascade');
            $table->foreignId('id_approver')->constrained('users', 'id_user');

            $table->string('level_persetujuan', 50); 
            $table->enum('aksi', ['Review', 'Setuju', 'Revisi', 'Tolak']);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('log_persetujuans');
    }
};