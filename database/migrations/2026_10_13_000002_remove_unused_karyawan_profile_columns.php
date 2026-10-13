<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $columns = [
        'jenis_kelamin',
        'rekomendator',
        'jabatan_fungsional',
        'pangkat_jabatan_fungsional',
    ];

    public function up(): void
    {
        if (!Schema::hasTable('karyawans')) {
            return;
        }

        $columnsToDrop = array_values(array_filter(
            $this->columns,
            fn (string $column) => Schema::hasColumn('karyawans', $column)
        ));

        if ($columnsToDrop) {
            Schema::table('karyawans', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('karyawans')) {
            return;
        }

        Schema::table('karyawans', function (Blueprint $table) {
            $table->string('jenis_kelamin', 20)->nullable();
            $table->string('rekomendator', 150)->nullable();
            $table->string('jabatan_fungsional', 100)->nullable();
            $table->string('pangkat_jabatan_fungsional', 100)->nullable();
        });
    }
};
