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
        Schema::table('pencairan_danas', function (Blueprint $table) {
            $table->json('approval_dates')->nullable()->after('tanggal_pengajuan');
            
            $table->dropColumn([
                'tanggal_divalidasi_baak',
                'tanggal_diketahui_unit',
                'tanggal_diverifikasi_bauk',
                'tanggal_disetujui_wr2',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pencairan_danas', function (Blueprint $table) {
            $table->dropColumn('approval_dates');
            
            $table->dateTime('tanggal_divalidasi_baak')->nullable();
            $table->dateTime('tanggal_diketahui_unit')->nullable();
            $table->dateTime('tanggal_diverifikasi_bauk')->nullable();
            $table->dateTime('tanggal_disetujui_wr2')->nullable();
        });
    }
};
