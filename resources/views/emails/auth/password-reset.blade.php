@component('mail::message')
# Atur Ulang Password

Halo {{ $name }},

Anda menerima email ini karena kami menerima permintaan *reset password* untuk akun Anda.

Silakan klik tombol di bawah ini untuk mengatur ulang *password* Anda:

@component('mail::button', ['url' => $resetUrl])
Atur Ulang Password
@endcomponent

Link *reset password* ini akan kedaluwarsa dalam {{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} menit.

Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini.

Terima kasih.
Salam Hormat,
{{ config('app.name') }}
@endcomponent