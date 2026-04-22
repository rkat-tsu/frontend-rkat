@component('mail::message')
# Verifikasi Alamat Email

Halo **{{ $name ?? 'Pengguna Baru' }}**,

Selamat datang di **{{ config('app.name') }}**! Langkah terakhir untuk mengaktifkan akun Anda adalah dengan memverifikasi alamat email Anda.

Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:

@component('mail::button', ['url' => $verificationUrl, 'color' => 'teal'])
Verifikasi Email
@endcomponent

Jika Anda tidak membuat akun, tidak ada tindakan lebih lanjut yang diperlukan.

Terima kasih,<br>
Tim IT {{ config('app.name') }}

@slot('subcopy')
Jika Anda kesulitan mengklik tombol "Verifikasi Email", salin dan tempel URL di bawah ini ke browser web Anda:
[{{ $verificationUrl }}]({{ $verificationUrl }})
@endslot
@endcomponent