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
        Schema::table('unit', function (Blueprint $table) {
            // Add no_telepon and email columns if they don't exist
            if (!Schema::hasColumn('unit', 'no_telepon')) {
                $table->string('no_telepon', 20)->nullable()->after('parent_id');
            }
            if (!Schema::hasColumn('unit', 'email')) {
                $table->string('email')->nullable()->after('no_telepon');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit', function (Blueprint $table) {
            $table->dropColumn(['no_telepon', 'email']);
        });
    }
};
