<?php

// app/Models/RkatHeader.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RkatHeader extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_header';

    protected $fillable = [
        'tahun_anggaran',
        'id_unit',
        'diajukan_oleh',
        'nomor_dokumen',
        'status_persetujuan',
        'tanggal_pengajuan',
        'tanggal_disetujui_unit_kepala',
        'tanggal_disetujui_dekan_kepala',
        'tanggal_disetujui_tim_renbang',
        'tanggal_disetujui_wr1',
        'tanggal_disetujui_wr3',
        'tanggal_disetujui_wr2',
        'total_anggaran',
        'parent_id',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
        'tanggal_disetujui_unit_kepala' => 'datetime',
        'tanggal_disetujui_dekan_kepala' => 'datetime',
        'tanggal_disetujui_tim_renbang' => 'datetime',
        'tanggal_disetujui_wr1' => 'datetime',
        'tanggal_disetujui_wr3' => 'datetime',
        'tanggal_disetujui_wr2' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    // Relasi ke TahunAnggaran
    public function tahun_obj()
    {
        return $this->belongsTo(TahunAnggaran::class, 'tahun_anggaran', 'tahun_anggaran')->withTrashed();
    }

    // Relasi ke User (yang mengajukan)
    public function user()
    {
        // Asumsi model User Anda ada di App\Models\User dan primary key-nya id_user
        return $this->belongsTo(User::class, 'diajukan_oleh', 'id_user');
    }

    // Fungsi ini sekarang sudah benar karena 'use' statement di atas
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'id_unit', 'id_unit')->withTrashed();
    }

    public function rkatDetails()
    {
        return $this->hasMany(RkatDetail::class, 'id_header', 'id_header');
    }

    public function logPersetujuans()
    {
        return $this->hasMany(LogPersetujuan::class, 'id_header', 'id_header');
    }

    /**
     * Generate a sequential document number for RKAT per year and unit.
     * Format: RKAT-{tahun}-{unit}-{sequence:04}
     */
    public static function generateNomorDokumen(int $tahunAnggaran, int $idUnit): string
    {
        $prefix = sprintf('RKAT-%d-%d', $tahunAnggaran, $idUnit);

        // Find last nomor_dokumen for same year and unit and increment sequence
        $last = self::query()->where('tahun_anggaran', $tahunAnggaran)
            ->where('id_unit', $idUnit)
            ->where('nomor_dokumen', 'like', $prefix . '%')
            ->orderBy('id_header', 'desc')
            ->value('nomor_dokumen');

        $nextSeq = 1;
        if ($last) {
            // extract trailing sequence (assumes suffix like -0001)
            $parts = explode('-', $last);
            $lastSeq = intval(end($parts));
            $nextSeq = $lastSeq + 1;
        }

        return sprintf('%s-%04d', $prefix, $nextSeq);
    }
}
