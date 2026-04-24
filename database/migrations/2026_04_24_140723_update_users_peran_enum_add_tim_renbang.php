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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('peran', [
                'Inputer', 'Kaprodi', 'Kepala_Unit', 'Dekan', 'Tim_Renbang', 'WR_1', 'WR_2', 'WR_3', 'Rektor', 'Admin'
            ])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('peran', [
                'Inputer', 'Kaprodi', 'Kepala_Unit', 'Dekan', 'WR_1', 'WR_2', 'WR_3', 'Rektor', 'Admin'
            ])->change();
        });
    }
};
