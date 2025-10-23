@component('mail::message')
# ✅ RKAT Anda Telah Disetujui!

Yth. **{{ $rkatHeader->pengaju->nama_lengkap ?? 'Bapak/Ibu' }}**,

Kami dengan senang hati menginformasikan bahwa pengajuan Rencana Kegiatan dan Anggaran Tahunan (RKAT) Anda: **"{{ $judul }}"** telah **DISETUJUI** pada level **{{ $level_persetujuan ?? 'Manajemen' }}** oleh **{{ $approver }}**.

---

### 📋 Detail Proses Persetujuan

| Informasi | Keterangan |
| :--- | :--- |
| **Nomor/Judul RKAT** | {{ $judul }} |
| **Unit Kerja** | {{ $departemen }} |
| **Disetujui Oleh** | {{ $approver }} |
| **Status Saat Ini** | **DISETUJUI** (Menunggu Proses Selanjutnya) |

### ➡️ Tindak Lanjut

Kami mohon agar Anda segera memantau status persetujuan ini di sistem. Dokumen akan diteruskan ke peninjau (reviewer) pada level berikutnya dalam alur kerja (workflow).

@component('mail::button', ['url' => url('/rkat/' . $headerId), 'color' => 'success'])
**Lihat Detail & Riwayat Persetujuan**
@endcomponent

Terima kasih atas kerja keras dan kontribusi Anda dalam perencanaan anggaran ini.

Salam Hormat,

Tim Administrasi **{{ config('app.name') }}**
@endcomponent