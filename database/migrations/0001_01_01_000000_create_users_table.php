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
        Schema::create('users', function (Blueprint $table) {
            $table->id('id_user');
            $table->string('username', 50)->unique()->nullable();
            $table->string('nama_lengkap', 100);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->enum('peran', [
                'Inputer_Prodi', 'Inputer_Unit', 
                'Kaprodi', 'Kepala_Biro', 
                'Dekan', 'WR_1', 'WR_2', 'WR_3', 
                'Rektor', 'Admin'
            ]);
            $table->unsignedBigInteger('id_departemen')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->string('password');
            $table->string('no_telepon', 15)->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
