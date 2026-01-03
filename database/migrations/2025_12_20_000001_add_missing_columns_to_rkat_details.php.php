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
        Schema::table('rkat_details', function (Blueprint $table) {
            if (! Schema::hasColumn('rkat_details', 'rasional')) {
                $table->text('rasional')->nullable()->after('latar_belakang');
            }
            if (! Schema::hasColumn('rkat_details', 'tujuan')) {
                $table->text('tujuan')->nullable()->after('rasional');
            }
            if (! Schema::hasColumn('rkat_details', 'mekanisme')) {
                $table->text('mekanisme')->nullable()->after('tujuan');
            }
            if (! Schema::hasColumn('rkat_details', 'lokasi_pelaksanaan')) {
                $table->string('lokasi_pelaksanaan', 255)->nullable()->after('jadwal_pelaksanaan_akhir');
            }
            if (! Schema::hasColumn('rkat_details', 'keberlanjutan')) {
                $table->string('keberlanjutan', 100)->nullable()->after('lokasi_pelaksanaan');
            }
            if (! Schema::hasColumn('rkat_details', 'pjawab')) {
                $table->string('pjawab', 150)->nullable()->after('keberlanjutan');
            }
            if (! Schema::hasColumn('rkat_details', 'target')) {
                $table->text('target')->nullable()->after('pjawab');
            }
            if (! Schema::hasColumn('rkat_details', 'jenis_kegiatan')) {
                $table->string('jenis_kegiatan', 100)->nullable()->after('target');
            }
            if (! Schema::hasColumn('rkat_details', 'dokumen_pendukung')) {
                $table->text('dokumen_pendukung')->nullable()->after('jenis_kegiatan');
            }
            if (! Schema::hasColumn('rkat_details', 'jenis_pencairan')) {
                $table->string('jenis_pencairan', 50)->nullable()->after('dokumen_pendukung');
            }
            if (! Schema::hasColumn('rkat_details', 'nama_bank')) {
                $table->string('nama_bank', 150)->nullable()->after('jenis_pencairan');
            }
            if (! Schema::hasColumn('rkat_details', 'nomor_rekening')) {
                $table->string('nomor_rekening', 100)->nullable()->after('nama_bank');
            }
            if (! Schema::hasColumn('rkat_details', 'atas_nama')) {
                $table->string('atas_nama', 150)->nullable()->after('nomor_rekening');
            }
        });
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            // Kolom penghubung agar 1 Kegiatan punya BANYAK Indikator
            $table->foreignId('id_rkat_detail')
                ->nullable() // Boleh null dulu untuk antisipasi data lama
                ->after('id_indikator')
                ->constrained('rkat_details', 'id_rkat_detail')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rkat_details', function (Blueprint $table) {
            $cols = [
                'rasional', 'tujuan', 'mekanisme', 'lokasi_pelaksanaan', 'keberlanjutan', 'pjawab', 'target',
                'jenis_kegiatan', 'dokumen_pendukung', 'jenis_pencairan', 'nama_bank', 'nomor_rekening', 'atas_nama',
            ];
            foreach ($cols as $c) {
                if (Schema::hasColumn('rkat_details', $c)) {
                    $table->dropColumn($c);
                }
            }
        });
        Schema::table('indikator_keberhasilans', function (Blueprint $table) {
            $table->dropForeign(['id_rkat_detail']);
            $table->dropColumn('id_rkat_detail');
        });
    }
};
