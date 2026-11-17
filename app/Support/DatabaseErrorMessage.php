<?php

namespace App\Support;

use Illuminate\Database\QueryException;
use Throwable;

class DatabaseErrorMessage
{
    /** Return a user-friendly explanation for common database errors. */
    public static function explain(Throwable $exception): ?string
    {
        if (!$exception instanceof QueryException) {
            return null;
        }

        $previous = $exception->getPrevious();
        $errorInfo = $previous?->errorInfo ?? [];
        $sqlState = (string) ($errorInfo[0] ?? $exception->getCode());
        $driverCode = (int) ($errorInfo[1] ?? 0);

        $description = match (true) {
            $sqlState === '22001', $driverCode === 1406 => 'Teks terlalu panjang. Kurangi panjang isian.',
            $sqlState === '22007', $driverCode === 1292 => 'Format tanggal atau waktu tidak valid. Periksa kembali isian tanggal.',
            $sqlState === '22003', $driverCode === 1264 => 'Angka berada di luar batas yang diperbolehkan.',
            $sqlState === '22004', $driverCode === 1048 => 'Isian wajib tidak boleh kosong.',
            $sqlState === '23505', $driverCode === 1062 => 'Data sudah digunakan. Periksa kemungkinan data duplikat.',
            $sqlState === '23503', $driverCode === 1452 => 'Data terkait tidak ditemukan. Muat ulang halaman dan pilih data yang tersedia.',
            $driverCode === 1451 => 'Data tidak dapat dihapus karena masih digunakan oleh data lain.',
            $sqlState === '23502' => 'Isian wajib tidak boleh kosong.',
            $sqlState === '23000' => 'Data tidak dapat disimpan karena melanggar aturan relasi atau keunikan.',
            $sqlState === '42S22', $driverCode === 1054 => 'Struktur data tidak sesuai. Hubungi administrator.',
            $sqlState === '42S02', $driverCode === 1146 => 'Data yang dibutuhkan tidak tersedia. Hubungi administrator.',
            $sqlState === '42000' => 'Permintaan database tidak dapat diproses. Hubungi administrator.',
            str_starts_with($sqlState, '08'), in_array($driverCode, [2002, 2003, 2006], true) => 'Koneksi ke database bermasalah. Coba lagi beberapa saat.',
            default => null,
        };

        return $description === null
            ? null
            : "{$description} (SQLSTATE[{$sqlState}]" . ($driverCode ? ", MySQL {$driverCode}" : '') . ').';
    }

    public static function forUser(Throwable $exception, string $fallback): string
    {
        return self::explain($exception) ?? $fallback;
    }
}
