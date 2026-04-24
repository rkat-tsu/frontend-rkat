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
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            $table->renameColumn('capai_2025', 'capai_2026');
            $table->renameColumn('target_2025', 'target_2026');
            $table->renameColumn('capai_2024', 'capai_2025');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            $table->renameColumn('capai_2025', 'capai_2024');
            $table->renameColumn('target_2026', 'target_2025');
            $table->renameColumn('capai_2026', 'capai_2025');
        });
    }
};
