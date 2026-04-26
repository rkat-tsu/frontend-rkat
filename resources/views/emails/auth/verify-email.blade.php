@component('mail::message')
# Verifikasi Alamat Email

Halo **{{ $name ?? 'Pengguna Baru' }}**,

Selamat bergabung di **{{ config('app.name') }}**! Kami sangat senang Anda menjadi bagian dari platform kami. 

Sebelum memulai, kami perlu memverifikasi bahwa ini adalah alamat email Anda yang sah untuk memastikan keamanan akun Anda.

---

@component('mail::button', ['url' => $verificationUrl, 'color' => 'blue'])
Verifikasi Alamat Email
@endcomponent

---

**Mengapa verifikasi ini penting?**
*   Mengamankan akses ke akun Anda.
*   Memastikan Anda menerima notifikasi penting terkait sistem.
*   Mengaktifkan fitur penuh di dashboard **{{ config('app.name') }}**.

Jika Anda tidak merasa mendaftar di sistem kami, silakan abaikan email ini.

Terima kasih,<br>
**Tim IT {{ config('app.name') }}**

@slot('subcopy')
Jika Anda kesulitan mengklik tombol "Verifikasi Alamat Email", salin dan tempel URL di bawah ini ke browser web Anda:
[{{ $verificationUrl }}]({{ $verificationUrl }})
@endslot
@endcomponent