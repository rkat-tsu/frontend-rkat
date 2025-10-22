@component('mail::message')
# RKAT Anda Telah Disetujui

Yth. {{ $rkatHeader->pengaju->nama_lengkap ?? 'Pengaju' }},

Kami informasikan bahwa pengajuan RKAT Anda, **{{ $judul }}**, telah disetujui pada level manajemen oleh {{ $approver }}.

**Detail Pengajuan:**
| Departemen | Status Saat Ini |
| :--- | :--- |
| {{ $departemen }} | Disetujui (Menunggu Level Berikutnya) |

Mohon untuk memantau status pengajuan ini di sistem.

@component('mail::button', ['url' => url('/rkat/' . $headerId)])
Lihat Detail RKAT
@endcomponent

Terima kasih atas kontribusi Anda.

Salam Hormat,
{{ config('app.name') }}
@endcomponent