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
        Schema::table('rkat_headers', function (Blueprint $table) {
            $table->json('approval_dates')->nullable()->after('tanggal_pengajuan');
            
            // Hapus kolom-kolom lama yang tidak relevan lagi
            $table->dropColumn([
                'tanggal_disetujui_unit_kepala',
                'tanggal_disetujui_dekan_kepala',
                'tanggal_disetujui_tim_renbang',
                'tanggal_disetujui_wr1',
                'tanggal_disetujui_wr3',
                'tanggal_disetujui_wr2',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rkat_headers', function (Blueprint $table) {
            $table->dropColumn('approval_dates');
            
            $table->dateTime('tanggal_disetujui_unit_kepala')->nullable();
            $table->dateTime('tanggal_disetujui_dekan_kepala')->nullable();
            $table->dateTime('tanggal_disetujui_tim_renbang')->nullable();
            $table->dateTime('tanggal_disetujui_wr1')->nullable();
            $table->dateTime('tanggal_disetujui_wr3')->nullable();
            $table->dateTime('tanggal_disetujui_wr2')->nullable();
        });
    }
};

