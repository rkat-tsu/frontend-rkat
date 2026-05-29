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
            $table->unsignedBigInteger('pencairan_approval_path_id')->nullable()->after('approval_path_id');
            $table->foreign('pencairan_approval_path_id')->references('id')->on('approval_paths')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('unit', function (Blueprint $table) {
            $table->dropForeign(['pencairan_approval_path_id']);
            $table->dropColumn('pencairan_approval_path_id');
        });
    }
};
