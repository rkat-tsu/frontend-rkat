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
        Schema::create('unit', function (Blueprint $table) {
            $table->id('id_unit');
            $table->string('kode_unit', 10)->unique();
            $table->string('nama_unit', 100);
            $table->enum('tipe_unit', [
                'Rektorat',
                'Fakultas',
                'Prodi',
                'Biro',
                'Lembaga',
                'UPT',
                'Satuan',
                'UKM',
                'Unit',
                'Admin',
                'Lainnya'
            ]);
            $table->enum('jalur_persetujuan', ['akademik', 'non-akademik']);
            $table->unsignedBigInteger('id_kepala')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('no_telepon', 20)->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
            $table->foreign('parent_id')->references('id_unit')->on('unit')->onDelete('cascade');
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id('id_user');
            $table->string('username', 50)->unique()->nullable();
            $table->string('nama_lengkap', 100);
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->enum('peran', ['Inputer', 'Kaprodi', 'Kepala_Unit', 'Dekan', 'WR_1', 'WR_2', 'WR_3', 'Rektor', 'Admin'])->index('idx_users_peran'); // Indeks ditambahkan
            $table->unsignedBigInteger('id_unit')->nullable()->index('idx_users_id_unit');
            $table->boolean('is_aktif')->default(true);
            $table->string('password');
            $table->string('no_telepon', 15)->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('id_unit')->references('id_unit')->on('unit')->onDelete('set null');
        });

        Schema::table('unit', function (Blueprint $table) {
            $table->foreign('id_kepala')->references('id_user')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('unit');
        Schema::dropIfExists('users');
    }
};
