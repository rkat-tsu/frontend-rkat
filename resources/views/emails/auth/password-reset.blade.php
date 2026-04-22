@component('mail::message')
# Atur Ulang Kata Sandi

Halo **{{ $name }}**,

Anda menerima email ini karena kami menerima permintaan pengaturan ulang kata sandi untuk akun Anda di sistem **{{ config('app.name') }}**.

@component('mail::button', ['url' => $resetUrl, 'color' => 'teal'])
Atur Ulang Kata Sandi
@endcomponent

Tautan pengaturan ulang kata sandi ini akan kedaluwarsa dalam **{{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} menit**.

Jika Anda tidak merasa melakukan permintaan ini, tidak ada tindakan lebih lanjut yang diperlukan. Keamanan akun Anda tetap terjaga.

Terima kasih,<br>
Tim IT {{ config('app.name') }}

@slot('subcopy')
Jika Anda kesulitan mengklik tombol "Atur Ulang Kata Sandi", salin dan tempel URL di bawah ini ke browser web Anda:
[{{ $resetUrl }}]({{ $resetUrl }})
@endslot
@endcomponent