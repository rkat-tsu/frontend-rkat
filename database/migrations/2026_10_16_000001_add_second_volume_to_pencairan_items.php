<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pencairan_dana_items', function (Blueprint $table) {
            $table->decimal('volume_pencairan2', 10, 2)->nullable()->after('volume_pencairan');
        });

        DB::table('pencairan_dana_items')->update(['volume_pencairan2' => 0]);
    }

    public function down(): void
    {
        Schema::table('pencairan_dana_items', function (Blueprint $table) {
            $table->dropColumn('volume_pencairan2');
        });
    }
};
