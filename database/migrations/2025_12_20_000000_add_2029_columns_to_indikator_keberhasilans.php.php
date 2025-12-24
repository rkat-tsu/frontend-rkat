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
            if (!Schema::hasColumn('indikator_keberhasilans', 'target_2029')) {
                $table->text('target_2029')->nullable()->after('target_2025');
            }
            if (!Schema::hasColumn('indikator_keberhasilans', 'capai_2029')) {
                $table->text('capai_2029')->nullable()->after('capai_2025');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            if (Schema::hasColumn('indikator_keberhasilans', 'target_2029')) {
                $table->dropColumn('target_2029');
            }
            if (Schema::hasColumn('indikator_keberhasilans', 'capai_2029')) {
                $table->dropColumn('capai_2029');
            }
        });
    }
};
