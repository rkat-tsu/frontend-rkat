<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rkat_rab_items', function (Blueprint $table) {
            $table->decimal('volume2', 10, 2)->nullable()->after('satuan');
            $table->string('satuan2', 50)->nullable()->after('volume2');
        });
    }

    public function down(): void
    {
        Schema::table('rkat_rab_items', function (Blueprint $table) {
            $table->dropColumn(['volume2', 'satuan2']);
        });
    }
};
