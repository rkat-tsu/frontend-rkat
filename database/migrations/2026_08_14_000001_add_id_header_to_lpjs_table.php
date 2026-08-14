<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lpjs', function (Blueprint $table) {
            if (!Schema::hasColumn('lpjs', 'id_header')) {
                $table->unsignedBigInteger('id_header')->nullable()->after('id_pencairan');
                $table->foreign('id_header')->references('id_header')->on('rkat_headers')->onDelete('cascade');
            }
            $table->unsignedBigInteger('id_pencairan')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('lpjs', function (Blueprint $table) {
            if (Schema::hasColumn('lpjs', 'id_header')) {
                $table->dropForeign(['id_header']);
                $table->dropColumn('id_header');
            }
            $table->unsignedBigInteger('id_pencairan')->nullable(false)->change();
        });
    }
};
