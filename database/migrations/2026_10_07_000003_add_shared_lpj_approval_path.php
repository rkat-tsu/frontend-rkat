<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_path_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->foreignId('approval_path_id')->nullable()->constrained('approval_paths')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('lpjs', function (Blueprint $table) {
            $table->unsignedInteger('current_approval_step')->nullable()->after('status_lpj');
        });
    }

    public function down(): void
    {
        Schema::table('lpjs', function (Blueprint $table) {
            $table->dropColumn('current_approval_step');
        });

        Schema::dropIfExists('approval_path_settings');
    }
};
