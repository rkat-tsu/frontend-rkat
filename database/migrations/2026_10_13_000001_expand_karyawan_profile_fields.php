<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('karyawans')) {
            return;
        }

        Schema::table('karyawans', function (Blueprint $table) {
            if (!Schema::hasColumn('karyawans', 'nidn')) {
                $table->string('nidn', 50)->nullable()->index();
            }
            if (!Schema::hasColumn('karyawans', 'nuptk')) {
                $table->string('nuptk', 50)->nullable()->index();
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('karyawans')) {
            return;
        }

        Schema::table('karyawans', function (Blueprint $table) {
            foreach (['nidn', 'nuptk'] as $column) {
                if (Schema::hasColumn('karyawans', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
