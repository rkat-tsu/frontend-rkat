# Sistem RKAT Kampus 📊

**Sistem RKAT** (Rencana Kegiatan dan Anggaran Tahunan) adalah sebuah aplikasi berbasis Laravel yang dirancang untuk mengelola proses pengajuan, *review*, dan persetujuan anggaran tahunan di lingkungan perguruan tinggi. Sistem ini menjamin akuntabilitas melalui hierarki organisasi kompleks dan alur persetujuan bertingkat (multi-level workflow).

---

## 🚀 Fitur dan Kapabilitas Utama

Sistem ini dikembangkan untuk mengoptimalkan proses perencanaan anggaran dengan fitur-fitur kunci:

* **Header-Detail Budgeting:** Memungkinkan satu dokumen pengajuan RKAT (`rkat_headers`) untuk memuat banyak baris kegiatan dan anggaran (`rkat_details`), mempermudah proses input.
* **Workflow Approval Bertingkat:** Mendukung alur persetujuan yang ketat: **Kaprodi/Kepala Biro** $\rightarrow$ **Dekan/Kepala BPUK** $\rightarrow$ **WR 1** $\rightarrow$ **WR 3** $\rightarrow$ **WR 2 (Final)**.
* **Role-Based Access Control (RBAC):** Pemisahan peran yang jelas antara **Inputer** (Staf/Sekretaris) dan **Approver** (Kepala Unit/Biro) untuk menghindari *self-approval*.
* **Audit Trail:** Pencatatan riwayat persetujuan yang detail di tabel `log_persetujuans`, memastikan setiap aksi terekam.

---

## 🛠️ Prasyarat Instalasi

Pastikan sistem Anda memiliki komponen berikut sebelum instalasi:

* **PHP** (v8.1+)
* **Composer**
* Database **MySQL/MariaDB**
* Laravel (v10+)

---

## ⚙️ Instalasi dan Setup Proyek

Ikuti langkah-langkah berikut untuk menginisialisasi proyek dan *database* lokal Anda.

### 1. Kloning Repositori & Instalasi Dependensi

```bash
git clone [URL-REPOSitori-ANDA] sistem-rkat
cd sistem-rkat
composer install
```

### 2. Konfigurasi LingkunganSalin file lingkungan dan buat kunci aplikasi:

``` bash
cp .env.example .env
php artisan key:generate
```

CATATAN: Edit file .env dan sesuaikan parameter DB_CONNECTION, DB_DATABASE, DB_USERNAME, dan DB_PASSWORD sesuai konfigurasi lokal Anda.

### 3. Migrasi Database

Gunakan perintah ini untuk membuat semua tabel dan relasi yang diperlukan.⚠️ PERHATIAN: Perintah ini akan menghapus semua data yang ada di database Anda sebelum membuat skema baru.

``` Bash
php artisan migrate:fresh
```
### 4. Instalasi & Kompilasi Aset Frontend

Instal dependensi JavaScript/Node.js dan kompilasi aset frontend (CSS/JS) yang diperlukan oleh aplikasi.

```Bash
npm install
npm run dev
```

#### 5. Jalankan Aplikasi

Aplikasi sekarang siap dijalankan. Anda dapat mengaksesnya di browser Anda, biasanya di http://127.0.0.1:8000.

```Bash
php artisan serve
```

## 🗃️ Struktur Data Inti

Skema ini adalah inti dari Sistem RKAT dan relasi antar tabelnya:
| Tabel | Fungsi | Relasi Kunci Penting |
| :--- | :--- | :--- |
| `rkat_headers` | **Dokumen Pengajuan Utama**. Menyimpan status persetujuan dan data unit. | **PK** `id_header` |
| `rkat_details` | **Item Baris Anggaran/Kegiatan** (dapat banyak). | **FK** `id_header` (One-to-Many ke `rkat_headers`) |
| `penggunas` | Menyimpan **data user dan peran** (Inputer, Kaprodi, WR, dll.). | **FK** ke tabel `departemens` (Relasi dibuat terpisah) |
| `log_persetujuans` | Mencatat **riwayat persetujuan** dan catatan reviewer. | **FK** `id_header` (ke `rkat_headers`), **FK** `id_approver` (ke `penggunas`) |

## 🧑‍💻 Tim Kontributor

Proyek *Sistem RKAT Kampus* ini dikembangkan oleh tim berikut:
* Fauzi Adam Prasetyo - Frontend Developer
* Java Dewangga - Backend Developer
* Alifudin Nurhafidzi - Backend Developer
* Rhenaldy T.D.P - UI/UX Designer


<footer>Copyright @ 2025 - TSU BPUK</footer>