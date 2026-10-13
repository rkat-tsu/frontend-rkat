<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jenis_kegiatan_options', function (Blueprint $table) {
            $table->id();
            $table->string('grup', 100)->default('Form RKAT');
            $table->string('kode_grup', 100)->default('jenis_kegiatan');
            $table->string('nama', 100);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['kode_grup', 'nama']);
        });

        DB::table('jenis_kegiatan_options')->insert([
            ['grup' => 'Form RKAT', 'kode_grup' => 'jenis_kegiatan', 'nama' => 'Rutin', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['grup' => 'Form RKAT', 'kode_grup' => 'jenis_kegiatan', 'nama' => 'Inovasi', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Replace the fixed ENUM so administrators can add other option values.
        DB::statement("ALTER TABLE rkat_details MODIFY jenis_kegiatan VARCHAR(100) NOT NULL DEFAULT 'Rutin'");
    }

    public function down(): void
    {
        // Keep jenis_kegiatan as VARCHAR so existing custom values are never truncated.
        Schema::dropIfExists('jenis_kegiatan_options');
    }
};
