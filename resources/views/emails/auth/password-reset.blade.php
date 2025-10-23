@component('mail::message')
# ◆ Permintaan Atur Ulang Kata Sandi

Halo **{{ $name }}**,

Kami menerima permintaan untuk mengatur ulang kata sandi (password) untuk akun Anda di sistem **{{ config('app.name') }}**.

Kami mengerti bahwa keamanan akun Anda adalah prioritas. Untuk melanjutkan proses pengaturan ulang, silakan klik tombol di bawah ini:

@component('mail::button', ['url' => $resetUrl, 'color' => 'success'])
**Atur Ulang Kata Sandi Saya**
@endcomponent

### 📌 Catatan Penting:
1.  **Validitas Tautan:** Tautan (link) ini bersifat rahasia dan akan **kedaluwarsa dalam {{ config('auth.passwords.'.config('auth.defaults.passwords').'.expire') }} menit** demi alasan keamanan.
2.  **Keamanan:** Jika Anda tidak mengajukan permintaan ini, silakan abaikan email ini.

Mohon segera lakukan pengaturan ulang.

Terima kasih atas perhatian Anda.

Salam Hormat,

Tim Administrasi Sistem **{{ config('app.name') }}**
@endcomponent