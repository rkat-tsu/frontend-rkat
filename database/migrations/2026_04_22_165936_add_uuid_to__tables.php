<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Daftar tabel dan nama primary key-nya masing-masing
        $tables = [
            'users'                   => 'id_user',
            'unit'                    => 'id_unit',
            'tahun_anggarans'         => 'id_tahun',
            'rincian_anggarans'       => 'id_rincian_anggaran',
            'ikus'                    => 'id_iku',
            'ikks'                    => 'id_ikk',
            'rkat_details'            => 'id_rkat_detail',
            'rkat_rab_items'          => 'id',
            'indikator_keberhasilans' => 'id_indikator',
            'log_persetujuans'        => 'id_log',
        ];

        foreach ($tables as $tableName => $primaryKey) {
            // Cek agar tidak error jika tabel sudah memiliki kolom uuid
            if (!Schema::hasColumn($tableName, 'uuid')) {
                Schema::table($tableName, function (Blueprint $table) use ($primaryKey) {
                    $table->uuid('uuid')->unique()->after($primaryKey)->nullable();
                });

                // Generate UUID untuk data lama yang sudah ada di database
                $records = DB::table($tableName)->get();
                foreach ($records as $record) {
                    DB::table($tableName)
                        ->where($primaryKey, $record->$primaryKey)
                        ->update(['uuid' => Str::uuid()]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'users', 'unit', 'tahun_anggarans', 'rincian_anggarans',
            'ikus', 'ikks', 'rkat_details', 'rkat_rab_items',
            'indikator_keberhasilans', 'log_persetujuans'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasColumn($tableName, 'uuid')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('uuid');
                });
            }
        }
    }
};