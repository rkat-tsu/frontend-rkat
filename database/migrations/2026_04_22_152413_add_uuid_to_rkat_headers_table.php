<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('rkat_headers', function (Blueprint $table) {
            // Tambahkan kolom uuid
            $table->uuid('uuid')->unique()->after('id_header')->nullable();
        });

        // (Opsional) Jika tabel sudah ada datanya, generate UUID untuk data lama
        $rkats = DB::table('rkat_headers')->get();
        foreach ($rkats as $rkat) {
            DB::table('rkat_headers')->where('id_header', $rkat->id_header)->update(['uuid' => Str::uuid()]);
        }
    }

    public function down()
    {
        Schema::table('rkat_headers', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};