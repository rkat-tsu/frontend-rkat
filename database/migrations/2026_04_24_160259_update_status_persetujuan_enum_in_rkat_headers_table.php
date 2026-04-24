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
            $table->enum('status_persetujuan', [
                'Draft', 
                'Diajukan', 
                'Menunggu_Unit_Kepala',
                'Menunggu_Dekan_Kepala',
                'Menunggu_Tim_Renbang',
                'Revisi', 
                'Revisi_History',
                'Ditolak', 
                'Disetujui_L1',
                'Menunggu_WR1', 'Menunggu_WR2', 'Menunggu_WR3',
                'Disetujui_WR1', 'Disetujui_WR2', 'Disetujui_WR3',
                'Disetujui_Final'
            ])->default('Draft')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rkat_headers', function (Blueprint $table) {
            $table->enum('status_persetujuan', [
                'Draft', 
                'Diajukan', 
                'Menunggu_Unit_Kepala',
                'Menunggu_Dekan_Kepala',
                'Menunggu_Renbang',
                'Revisi', 
                'Revisi_History',
                'Ditolak', 
                'Disetujui_L1',
                'Menunggu_WR1', 'Menunggu_WR2', 'Menunggu_WR3',
                'Disetujui_WR1', 'Disetujui_WR2', 'Disetujui_WR3',
                'Disetujui_Final'
            ])->default('Draft')->change();
        });
    }
};
