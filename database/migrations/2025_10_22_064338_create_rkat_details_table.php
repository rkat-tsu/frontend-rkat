<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rkat_details', function (Blueprint $table) {
            $table->id('id_rkat_detail'); 
            
            // FK KRUSIAL: Menghubungkan ke RKAT_HEADER
            $table->foreignId('id_header')->constrained('rkat_headers', 'id_header')->onDelete('cascade');
            
            // Foreign Keys Item
            $table->string('kode_akun', 20);
            $table->foreign('kode_akun')->references('kode_akun')->on('akun_anggarans');
            $table->foreignId('id_program')->constrained('program_kerjas', 'id_program');

            // Detail Anggaran Per Baris
            $table->text('deskripsi_kegiatan');
            $table->decimal('volume', 10, 2);
            $table->string('satuan', 50);
            $table->decimal('harga_satuan', 18, 2);
            $table->decimal('jumlah_diusulkan', 18, 2)->storedAs('volume * harga_satuan');
            $table->decimal('jumlah_disetujui', 18, 2)->default(0.00);
            
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('rkat_details');
    }
};