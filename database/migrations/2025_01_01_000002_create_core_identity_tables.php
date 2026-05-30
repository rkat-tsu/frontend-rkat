<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unit', function (Blueprint $table) {
            $table->id('id_unit');
            $table->uuid('uuid')->unique()->nullable();
            $table->string('kode_unit', 20)->unique();
            $table->string('nama_unit', 100);
            $table->enum('tipe_unit', [
                'Rektorat', 'Fakultas', 'Prodi', 'Biro', 'Lembaga', 
                'UPT', 'Satuan', 'UKM', 'Unit', 'Admin', 'Lainnya', 'Atasan'
            ]);
            
            $table->unsignedBigInteger('approval_path_id')->nullable();
            $table->foreign('approval_path_id')->references('id')->on('approval_paths')->onDelete('set null');

            $table->unsignedBigInteger('pencairan_approval_path_id')->nullable();
            $table->foreign('pencairan_approval_path_id')->references('id')->on('approval_paths')->onDelete('set null');

            $table->unsignedBigInteger('id_kepala')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('no_telepon', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->foreign('parent_id')->references('id_unit')->on('unit')->onDelete('cascade');
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id('id_user');
            $table->uuid('uuid')->unique()->nullable();
            $table->string('username', 50)->unique()->nullable();
            $table->string('nik', 30)->nullable();
            $table->string('nama_lengkap', 100);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->enum('peran', ['Inputer', 'Kaprodi', 'Kepala_Unit', 'Dekan', 'Tim_Renbang', 'WR_1', 'WR_2', 'WR_3', 'Rektor', 'Admin'])->index('idx_users_peran');
            $table->unsignedBigInteger('id_unit')->nullable()->index('idx_users_id_unit');
            $table->boolean('is_aktif')->default(true);
            $table->string('password');
            $table->string('signature_path')->nullable();
            $table->string('no_telepon', 15)->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('id_unit')->references('id_unit')->on('unit')->onDelete('set null');
        });

        Schema::table('unit', function (Blueprint $table) {
            $table->foreign('id_kepala')->references('id_user')->on('users')->onDelete('set null');
        });
        
        // Add foreign key for sessions after users table is created
        Schema::table('sessions', function (Blueprint $table) {
            $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('sessions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::dropIfExists('users');
        Schema::dropIfExists('unit');
    }
};