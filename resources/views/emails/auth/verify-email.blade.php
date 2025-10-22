@component('mail::message')
# Verifikasi Alamat Email

Halo,

Selamat datang di Sistem RKAT Kampus. Sebelum melanjutkan, harap verifikasi alamat email Anda dengan mengklik tombol di bawah ini:

@component('mail::button', ['url' => $verificationUrl])
Verifikasi Alamat Email
@endcomponent

Jika Anda kesulitan mengklik tombol "Verifikasi Alamat Email", salin dan tempel URL di bawah ini ke *web browser* Anda: [{{ $verificationUrl }}]({{ $verificationUrl }})

Terima kasih.
Salam Hormat,
{{ config('app.name') }}
@endcomponent