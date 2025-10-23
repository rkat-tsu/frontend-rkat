@component('mail::message')
# ✅ Verifikasi Alamat Email Anda

Halo **{{ $name ?? 'Pengguna Baru' }}**,

Selamat datang dan terima kasih telah mendaftar di **Sistem RKAT Kampus**!

Langkah terakhir untuk mengaktifkan akun Anda adalah dengan memverifikasi alamat email ini. Proses ini penting untuk memastikan keamanan akun dan kelancaran komunikasi.

Silakan klik tombol di bawah ini untuk mengonfirmasi dan memverifikasi alamat email Anda:

@component('mail::button', ['url' => $verificationUrl, 'color' => 'success'])
**Verifikasi Akun Saya Sekarang** 🚀
@endcomponent

---

### 💡 Mengalami Kendala?
Jika Anda kesulitan mengklik tombol di atas, Anda juga dapat menyalin dan menempel (copy-paste) tautan di bawah ini ke *browser* Anda:
[{{ $verificationUrl }}]({{ $verificationUrl }})

Terima kasih atas kerja sama Anda. Setelah verifikasi berhasil, Anda akan dapat masuk ke sistem.

Salam Hormat,

Tim Administrasi **{{ config('app.name') }}**
@endcomponent