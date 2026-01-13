<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RkatDetail extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_rkat_detail';
    protected $table = 'rkat_details'; // Pastikan nama tabel benar

    protected $fillable = [
        'id_header',
        'kode_akun',
        'id_indikator', // Masih disimpan untuk kompatibilitas (bisa dihapus nanti jika full migrasi ke hasMany)
        'deskripsi_kegiatan', // <--- PENTING: Wajib ada di sini
        'judul_kegiatan',
        'id_iku',
        'id_ikusub',
        'id_ikk',
        'latar_belakang',
        'rasional',
        'tujuan',
        'mekanisme',
        'jadwal_pelaksanaan_mulai',
        'jadwal_pelaksanaan_akhir',
        'lokasi_pelaksanaan',
        'keberlanjutan',
        'pjawab',
        'target',
        'jenis_kegiatan',
        'dokumen_pendukung',
        'anggaran',
        'jenis_pencairan',
        'nama_bank',
        'nomor_rekening',
        'atas_nama',
    ];

    protected $casts = [
        'anggaran' => 'decimal:2',
        'dokumen_pendukung' => 'array',
        'jadwal_pelaksanaan_mulai' => 'date',
        'jadwal_pelaksanaan_akhir' => 'date',
    ];

    // --- RELASI ---

    // Relasi ke Header
    public function rkatHeader()
    {
        return $this->belongsTo(RkatHeader::class, 'id_header', 'id_header');
    }

    // Relasi ke Master IKU/IKK
    public function iku()
    {
        return $this->belongsTo(Iku::class, 'id_iku', 'id_iku');
    }

    public function ikuSub()
    {
        return $this->belongsTo(IkuSub::class, 'id_ikusub', 'id_ikusub');
    }

    public function ikk()
    {
        return $this->belongsTo(Ikk::class, 'id_ikk', 'id_ikk');
    }

    // Relasi Lama (Single Indikator - One to One)
    public function indikatorKeberhasilan()
    {
        return $this->belongsTo(IndikatorKeberhasilan::class, 'id_indikator', 'id_indikator');
    }

    // Relasi BARU (Banyak Indikator - One to Many)
    // Pastikan tabel 'indikator_keberhasilans' sudah punya kolom 'id_rkat_detail'
    public function indikators()
    {
        return $this->hasMany(IndikatorKeberhasilan::class, 'id_rkat_detail', 'id_rkat_detail');
    }

    // Relasi ke Item RAB
    public function rabItems()
    {
        return $this->hasMany(RkatRabItem::class, 'id_rkat_detail', 'id_rkat_detail');
    }
}