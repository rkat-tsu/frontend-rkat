<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. TAMBAHKAN FK id_departemen PADA TABEL PENGGUNAS
        // Ini menghubungkan pengguna ke unit/prodi tempatnya bernaung.
        Schema::table('penggunas', function (Blueprint $table) {
            $table->foreign('id_departemen')
                  ->references('id_departemen')
                  ->on('departemens')
                  ->onDelete('set null'); // Mengatur data ke NULL jika departemen dihapus
        });

        // Catatan: FK id_dekan (Fakultas) dan id_kepala (Departemen) DITANGGUHKAN
        // Anda harus membuat migration lain nanti untuk ini.
    }

    public function down(): void
    {
        // Hapus FK id_departemen dari tabel penggunas saat rollback
        Schema::table('penggunas', function (Blueprint $table) {
            $table->dropForeign(['id_departemen']);
        });
    }
};