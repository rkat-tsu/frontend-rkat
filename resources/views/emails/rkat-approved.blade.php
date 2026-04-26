@component('mail::message')
# RKAT Disetujui

Yth. **{{ $rkatHeader->user->nama_lengkap ?? 'Bapak/Ibu' }}**,

Kabar baik! Pengajuan Rencana Kegiatan dan Anggaran Tahunan (RKAT) Anda telah mendapatkan persetujuan.

Berikut adalah detail status pengajuan Anda:

@component('mail::table')
| Item | Detail |
| :--- | :--- |
| **Nomor Dokumen** | `{{ $rkatHeader->nomor_dokumen }}` |
| **Judul Kegiatan** | {{ $judul ?? '-' }} |
| **Unit Kerja** | {{ $unit ?? '-' }} |
| **Total Anggaran** | **Rp {{ number_format($rkatHeader->total_anggaran, 0, ',', '.') }}** |
| **Status Terbaru** | **{{ str_replace('_', ' ', $rkatHeader->status_persetujuan) }}** |
| **Disetujui Oleh** | {{ $approver ?? '-' }} |
@endcomponent

---

@component('mail::button', ['url' => route('rkat.show', $rkatHeader->uuid), 'color' => 'green'])
Lihat Detail Pengajuan
@endcomponent

---

Silakan pantau status pengajuan Anda melalui dashboard sistem untuk melihat riwayat persetujuan lengkap atau langkah selanjutnya yang mungkin diperlukan.

Terima kasih,<br>
**Tim IT {{ config('app.name') }}**
@endcomponent