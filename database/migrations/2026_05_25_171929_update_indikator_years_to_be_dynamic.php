<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add JSON column to tahun_anggarans
        Schema::table('tahun_anggarans', function (Blueprint $table) {
            $table->json('indikator_labels')->nullable()->after('status_rkat');
        });

        // 2. Add generic columns to indikator_keberhasilans
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            $table->string('past_capaian')->nullable()->after('nama_indikator');
            $table->string('current_target')->nullable()->after('past_capaian');
            $table->string('current_capaian')->nullable()->after('current_target');
            $table->string('future_target')->nullable()->after('current_capaian');
            $table->string('future_capaian')->nullable()->after('future_target');
        });

        // 3. Migrate data
        DB::statement("UPDATE indikator_keberhasilans SET past_capaian = capai_2025, current_target = target_2026, current_capaian = capai_2026, future_target = target_2029, future_capaian = capai_2029");

        // 4. Drop old columns
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            $table->dropColumn(['capai_2025', 'target_2026', 'capai_2026', 'target_2029', 'capai_2029']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            $table->string('capai_2025')->nullable()->after('nama_indikator');
            $table->string('target_2026')->nullable()->after('capai_2025');
            $table->string('capai_2026')->nullable()->after('target_2026');
            $table->string('target_2029')->nullable()->after('capai_2026');
            $table->string('capai_2029')->nullable()->after('target_2029');
        });

        DB::statement("UPDATE indikator_keberhasilans SET capai_2025 = past_capaian, target_2026 = current_target, capai_2026 = current_capaian, target_2029 = future_target, capai_2029 = future_capaian");

        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            $table->dropColumn(['past_capaian', 'current_target', 'current_capaian', 'future_target', 'future_capaian']);
        });

        Schema::table('tahun_anggarans', function (Blueprint $table) {
            $table->dropColumn('indikator_labels');
        });
    }
};
