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
        if (!Schema::hasColumn('unit', 'approval_path_id')) {
            Schema::table('unit', function (Blueprint $table) {
                $table->unsignedBigInteger('approval_path_id')->nullable()->after('tipe_unit');
                $table->foreign('approval_path_id')->references('id')->on('approval_paths')->onDelete('set null');
            });
        }

        if (!Schema::hasColumn('rkat_headers', 'current_step_id')) {
            Schema::table('rkat_headers', function (Blueprint $table) {
                $table->unsignedBigInteger('current_step_id')->nullable()->after('status_persetujuan');
                $table->foreign('current_step_id')->references('id')->on('approval_path_steps')->onDelete('set null');
            });
        } else {
            // Attempt to add foreign key if missing, safe to try catch or just ignore if already foreign key failed before.
            // But since the migration failed AT adding the foreign key, we can try to add the foreign key manually.
            try {
                Schema::table('rkat_headers', function (Blueprint $table) {
                    $table->foreign('current_step_id')->references('id')->on('approval_path_steps')->onDelete('set null');
                });
            } catch (\Exception $e) {}
        }
        
        DB::statement('ALTER TABLE rkat_headers MODIFY status_persetujuan VARCHAR(100) DEFAULT "Draft"');

        if (!Schema::hasColumn('pencairan_danas', 'current_step_id')) {
            Schema::table('pencairan_danas', function (Blueprint $table) {
                $table->unsignedBigInteger('current_step_id')->nullable()->after('status_pencairan');
                $table->foreign('current_step_id')->references('id')->on('approval_path_steps')->onDelete('set null');
            });
        }
        
        DB::statement('ALTER TABLE pencairan_danas MODIFY status_pencairan VARCHAR(100) DEFAULT "Draft"');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pencairan_danas', function (Blueprint $table) {
            $table->dropForeign(['current_step_id']);
            $table->dropColumn('current_step_id');
        });

        Schema::table('rkat_headers', function (Blueprint $table) {
            $table->dropForeign(['current_step_id']);
            $table->dropColumn('current_step_id');
        });

        Schema::table('unit', function (Blueprint $table) {
            $table->dropForeign(['approval_path_id']);
            $table->dropColumn('approval_path_id');
        });
    }
};
