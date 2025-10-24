<?php

// app/Models/RkatDetail.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RkatDetail extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_rkat_detail';

    protected $fillable = [
        'id_header',
        'kode_akun',
        'id_program',
        'deskripsi_kegiatan',
        'latar_belakang',
        'rasional',
        'tujuan',
        'mekanisme',
        'indikator_keberhasilan',
        'target',
        'kegiatan',
        'dokumen_pendukung',
        'waktu_pelaksanaan',
        'anggaran',
        'jenis_pencairan',
        'nama_bank',
        'nomor_rekening',
        'atas_nama',
    ];

    protected $casts = [
        'anggaran' => 'decimal:2',
        'dokumen_pendukung' => 'array', // Jika disimpan sebagai JSON di database
        'waktu_pelaksanaan' => 'date',
    ];

    // Relasi ke RkatHeader
    public function header()
    {
        return $this->belongsTo(RkatHeader::class, 'id_header', 'id_header');
    }
    
    // Relasi ke AkunAnggaran
    public function akunAnggaran()
    {
        return $this->belongsTo(AkunAnggaran::class, 'kode_akun', 'kode_akun');
    }
    
    // Relasi ke ProgramKerja
    public function programKerja()
    {
        return $this->belongsTo(ProgramKerja::class, 'id_program', 'id_proker');
    }
}
