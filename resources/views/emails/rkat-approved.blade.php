@component('mail::message')
# RKAT Disetujui

Yth. **{{ $rkatHeader->user->nama_lengkap ?? 'Bapak/Ibu' }}**,

Kami menginformasikan bahwa pengajuan Rencana Kegiatan dan Anggaran Tahunan (RKAT) Anda dengan judul: **"{{ $judul ?? '-' }}"** telah **DISETUJUI** oleh **{{ $approver ?? 'Atasan terkait' }}** pada tahap **{{ str_replace('_', ' ', $rkatHeader->status_persetujuan) }}**.

@component('mail::table')
| Detail | Keterangan |
| :--- | :--- |
| **Nomor Dokumen** | {{ $rkatHeader->nomor_dokumen }} |
| **Unit Kerja** | {{ $unit ?? '-' }} |
| **Total Anggaran** | Rp {{ number_format($rkatHeader->total_anggaran, 0, ',', '.') }} |
| **Status Saat Ini** | **{{ str_replace('_', ' ', $rkatHeader->status_persetujuan) }}** |
| **Disetujui Oleh** | {{ $approver ?? '-' }} |
@endcomponent

@component('mail::button', ['url' => route('rkat.show', $rkatHeader->id_header), 'color' => 'teal'])
Lihat Detail Pengajuan
@endcomponent

Silakan pantau status pengajuan Anda melalui dashboard sistem untuk melihat riwayat persetujuan atau langkah selanjutnya yang diperlukan.

Terima kasih,<br>
Tim IT {{ config('app.name') }}
@endcomponent