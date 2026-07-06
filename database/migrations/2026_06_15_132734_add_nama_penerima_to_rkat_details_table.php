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
        Schema::table('rkat_details', function (Blueprint $table) {
            $table->string('nama_penerima')->nullable()->after('atas_nama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rkat_details', function (Blueprint $table) {
            $table->dropColumn('nama_penerima');
        });
    }
};
