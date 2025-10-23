<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('id_departemen')
                  ->references('id_departemen')
                  ->on('departemens')
                  ->onDelete('set null'); // Mengatur data ke NULL jika departemen dihapus
        });
    }

    public function down(): void
    {
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['id_departemen']);
        });
    }
};