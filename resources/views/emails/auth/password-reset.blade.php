@component('mail::message')
# Atur Ulang Kata Sandi

Halo **{{ $name }}**,

Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di sistem **{{ config('app.name') }}**. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.

---

@component('mail::button', ['url' => $resetUrl, 'color' => 'blue'])
Atur Ulang Kata Sandi
@endcomponent

---

**Penting untuk diketahui:**
*   Tautan ini hanya berlaku selama **{{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} menit**.
*   Demi keamanan, jangan pernah membagikan email atau tautan ini kepada siapa pun.
*   Jika tombol di atas tidak berfungsi, Anda dapat menyalin tautan di bawah ini ke browser Anda.

Jika Anda tidak melakukan permintaan ini, tidak ada tindakan yang diperlukan. Akun Anda tetap aman bersama kami.

Terima kasih,<br>
**Tim IT {{ config('app.name') }}**

@slot('subcopy')
Jika Anda kesulitan mengklik tombol "Atur Ulang Kata Sandi", salin dan tempel URL di bawah ini ke browser web Anda:
[{{ $resetUrl }}]({{ $resetUrl }})
@endslot
@endcomponent