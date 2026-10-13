<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('jenis_kegiatan_options')) {
            Schema::table('jenis_kegiatan_options', function (Blueprint $table) {
                if (!Schema::hasColumn('jenis_kegiatan_options', 'grup')) {
                    $table->string('grup', 100)->default('Form RKAT');
                }
                if (!Schema::hasColumn('jenis_kegiatan_options', 'kode_grup')) {
                    $table->string('kode_grup', 100)->default('jenis_kegiatan');
                }
            });
            $indexes = collect(DB::select("SHOW INDEX FROM jenis_kegiatan_options"))->pluck('Key_name')->all();
            if (in_array('jenis_kegiatan_options_nama_unique', $indexes, true)) {
                Schema::table('jenis_kegiatan_options', function (Blueprint $table) {
                    $table->dropUnique('jenis_kegiatan_options_nama_unique');
                });
            }
            if (!in_array('jenis_kegiatan_options_kode_grup_nama_unique', $indexes, true)) {
                Schema::table('jenis_kegiatan_options', function (Blueprint $table) {
                    $table->unique(['kode_grup', 'nama']);
                });
            }
        }

        // Lookup values are maintained in the grouped options table.
        DB::statement("ALTER TABLE unit MODIFY tipe_unit VARCHAR(100) NOT NULL");
        DB::statement("ALTER TABLE users MODIFY peran VARCHAR(100) NOT NULL");

        if (Schema::hasTable('karyawans') && !Schema::hasColumn('users', 'id_karyawan')) {
            Schema::table('users', function (Blueprint $table) {
                $table->unsignedBigInteger('id_karyawan')->nullable()->after('id_user');
                $table->foreign('id_karyawan')->references('id_karyawan')->on('karyawans')->nullOnDelete();
                $table->unique('id_karyawan');
            });
        }

        if (Schema::hasTable('jenis_kegiatan_options')) {
            DB::table('jenis_kegiatan_options')->whereNull('grup')->update(['grup' => 'Form RKAT']);
            DB::table('jenis_kegiatan_options')->whereNull('kode_grup')->update(['kode_grup' => 'jenis_kegiatan']);
            $now = now();
            foreach ([
                ['Rektorat', 'tipe_unit', 'Rektorat'], ['Fakultas', 'tipe_unit', 'Fakultas'],
                ['Prodi', 'tipe_unit', 'Prodi'], ['Biro', 'tipe_unit', 'Biro'],
                ['Lembaga', 'tipe_unit', 'Lembaga'], ['UPT', 'tipe_unit', 'UPT'],
                ['Satuan', 'tipe_unit', 'Satuan'], ['UKM', 'tipe_unit', 'UKM'],
                ['Unit', 'tipe_unit', 'Unit'], ['Admin', 'tipe_unit', 'Admin'],
                ['Lainnya', 'tipe_unit', 'Lainnya'], ['Atasan', 'tipe_unit', 'Atasan'],
            ] as [$name, $groupCode, $label]) {
                $exists = DB::table('jenis_kegiatan_options')->where('kode_grup', $groupCode)->where('nama', $name)->exists();
                if (!$exists) {
                    DB::table('jenis_kegiatan_options')->insert([
                        'grup' => 'Unit Kerja', 'kode_grup' => $groupCode, 'nama' => $label,
                        'is_active' => true, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                }
            }
            DB::table('users')->where('peran', 'Rektor')->update(['peran' => 'Rektorat']);
            DB::table('approval_path_steps')->where('role_name', 'WR_1')->update(['role_name' => 'WR-1']);
            DB::table('approval_path_steps')->where('role_name', 'WR_2')->update(['role_name' => 'WR-2']);
            DB::table('approval_path_steps')->where('role_name', 'WR_3')->update(['role_name' => 'WR-3']);
            DB::table('approval_path_steps')->where('role_name', 'Rektor')->update(['role_name' => 'Rektorat']);
            foreach ([['WR_1', 'WR-1'], ['WR_2', 'WR-2'], ['WR_3', 'WR-3'], ['Rektorat', 'Rektorat']] as [$role, $unitName]) {
                $unitId = DB::table('unit')->where('nama_unit', $unitName)->value('id_unit');
                if ($unitId) DB::table('users')->where('peran', $role)->update(['id_unit' => $unitId]);
            }
        } 
    }

    public function down(): void
    {
        if (Schema::hasTable('approval_path_steps')) {
            DB::table('approval_path_steps')->where('role_name', 'WR-1')->update(['role_name' => 'WR_1']);
            DB::table('approval_path_steps')->where('role_name', 'WR-2')->update(['role_name' => 'WR_2']);
            DB::table('approval_path_steps')->where('role_name', 'WR-3')->update(['role_name' => 'WR_3']);
            DB::table('approval_path_steps')->where('role_name', 'Rektorat')->update(['role_name' => 'Rektor']);
        }
        DB::table('users')->where('peran', 'Rektorat')->update(['peran' => 'Rektor']);
        if (Schema::hasColumn('users', 'id_karyawan')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropForeign(['id_karyawan']);
                $table->dropUnique(['id_karyawan']);
                $table->dropColumn('id_karyawan');
            });
        }
        DB::statement("ALTER TABLE users MODIFY peran ENUM('Inputer','Kaprodi','Kepala_Unit','Dekan','Tim_Renbang','WR_1','WR_2','WR_3','Rektor','Admin') NOT NULL");
        DB::statement("ALTER TABLE unit MODIFY tipe_unit ENUM('Rektorat','Fakultas','Prodi','Biro','Lembaga','UPT','Satuan','UKM','Unit','Admin','Lainnya','Atasan') NOT NULL");
        if (Schema::hasTable('jenis_kegiatan_options')) {
            DB::table('jenis_kegiatan_options')->where('kode_grup', 'tipe_unit')->delete();
            $indexes = collect(DB::select("SHOW INDEX FROM jenis_kegiatan_options"))->pluck('Key_name')->all();
            if (in_array('jenis_kegiatan_options_kode_grup_nama_unique', $indexes, true)) {
                Schema::table('jenis_kegiatan_options', function (Blueprint $table) {
                    $table->dropUnique('jenis_kegiatan_options_kode_grup_nama_unique');
                });
            }
        }
        if (Schema::hasColumn('jenis_kegiatan_options', 'kode_grup')) {
            Schema::table('jenis_kegiatan_options', fn (Blueprint $table) => $table->dropColumn('kode_grup'));
        }
        if (Schema::hasColumn('jenis_kegiatan_options', 'grup')) {
            Schema::table('jenis_kegiatan_options', fn (Blueprint $table) => $table->dropColumn('grup'));
        }
    }
};
