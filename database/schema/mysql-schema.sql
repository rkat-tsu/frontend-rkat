/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `approval_path_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_path_settings` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_path_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`key`),
  KEY `approval_path_settings_approval_path_id_foreign` (`approval_path_id`),
  CONSTRAINT `approval_path_settings_approval_path_id_foreign` FOREIGN KEY (`approval_path_id`) REFERENCES `approval_paths` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `approval_path_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_path_steps` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `approval_path_id` bigint unsigned NOT NULL,
  `order` int NOT NULL,
  `step_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_type` enum('role','unit','parent_unit','self_unit_head') COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unit_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `approval_path_steps_approval_path_id_foreign` (`approval_path_id`),
  CONSTRAINT `approval_path_steps_approval_path_id_foreign` FOREIGN KEY (`approval_path_id`) REFERENCES `approval_paths` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `approval_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `approval_paths` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `approval_paths_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ikks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ikks` (
  `id_ikk` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_iku` bigint unsigned NOT NULL,
  `nama_ikk` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_ikk`),
  UNIQUE KEY `ikks_uuid_unique` (`uuid`),
  KEY `ikks_id_iku_foreign` (`id_iku`),
  CONSTRAINT `ikks_id_iku_foreign` FOREIGN KEY (`id_iku`) REFERENCES `ikus` (`id_iku`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `iku_change_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iku_change_logs` (
  `id_log` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_iku` bigint unsigned DEFAULT NULL,
  `id_user` bigint unsigned DEFAULT NULL,
  `tahun_anggaran` year DEFAULT NULL,
  `tipe_entitas` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IKU',
  `aksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_entitas` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ringkasan_perubahan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail_perubahan` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_log`),
  UNIQUE KEY `iku_change_logs_uuid_unique` (`uuid`),
  KEY `iku_change_logs_id_user_foreign` (`id_user`),
  CONSTRAINT `iku_change_logs_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ikus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ikus` (
  `id_iku` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun_anggaran` year DEFAULT NULL,
  `nama_iku` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_iku`),
  UNIQUE KEY `ikus_uuid_unique` (`uuid`),
  KEY `ikus_tahun_anggaran_index` (`tahun_anggaran`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `indikator_keberhasilans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `indikator_keberhasilans` (
  `id_indikator` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_rkat_detail` bigint unsigned NOT NULL,
  `nama_indikator` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `past_capaian` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_target` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_capaian` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `future_target` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `future_capaian` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_indikator`),
  UNIQUE KEY `indikator_keberhasilans_uuid_unique` (`uuid`),
  KEY `indikator_keberhasilans_id_rkat_detail_foreign` (`id_rkat_detail`),
  CONSTRAINT `indikator_keberhasilans_id_rkat_detail_foreign` FOREIGN KEY (`id_rkat_detail`) REFERENCES `rkat_details` (`id_rkat_detail`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `jenis_kegiatan_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jenis_kegiatan_options` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `grup` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Form RKAT',
  `kode_grup` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'jenis_kegiatan',
  PRIMARY KEY (`id`),
  UNIQUE KEY `jenis_kegiatan_options_kode_grup_nama_unique` (`kode_grup`,`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `karyawans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `karyawans` (
  `id_karyawan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nik` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_telepon` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_unit` bigint unsigned DEFAULT NULL,
  `jabatan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_pegawai` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tetap',
  `is_aktif` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `nidn` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nuptk` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_karyawan`),
  UNIQUE KEY `karyawans_uuid_unique` (`uuid`),
  KEY `karyawans_id_unit_foreign` (`id_unit`),
  KEY `karyawans_nik_index` (`nik`),
  KEY `karyawans_nidn_index` (`nidn`),
  KEY `karyawans_nuptk_index` (`nuptk`),
  CONSTRAINT `karyawans_id_unit_foreign` FOREIGN KEY (`id_unit`) REFERENCES `unit` (`id_unit`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `log_persetujuans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_persetujuans` (
  `id_log` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_header` bigint unsigned NOT NULL,
  `id_approver` bigint unsigned NOT NULL,
  `level_persetujuan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aksi` enum('Setuju','Tolak','Revisi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_log`),
  UNIQUE KEY `log_persetujuans_uuid_unique` (`uuid`),
  KEY `log_persetujuans_id_header_foreign` (`id_header`),
  KEY `log_persetujuans_id_approver_foreign` (`id_approver`),
  CONSTRAINT `log_persetujuans_id_approver_foreign` FOREIGN KEY (`id_approver`) REFERENCES `users` (`id_user`),
  CONSTRAINT `log_persetujuans_id_header_foreign` FOREIGN KEY (`id_header`) REFERENCES `rkat_headers` (`id_header`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `lpj_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lpj_items` (
  `id_lpj_item` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lpj` bigint unsigned NOT NULL,
  `id_pencairan_item` bigint unsigned NOT NULL,
  `volume_realisasi` decimal(10,2) NOT NULL DEFAULT '0.00',
  `harga_satuan_realisasi` decimal(15,2) NOT NULL DEFAULT '0.00',
  `sub_total_realisasi` decimal(15,2) NOT NULL DEFAULT '0.00',
  `selisih` decimal(15,2) NOT NULL DEFAULT '0.00',
  `nomor_kwitansi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_lpj_item`),
  UNIQUE KEY `lpj_items_uuid_unique` (`uuid`),
  KEY `lpj_items_id_lpj_foreign` (`id_lpj`),
  KEY `lpj_items_id_pencairan_item_foreign` (`id_pencairan_item`),
  CONSTRAINT `lpj_items_id_lpj_foreign` FOREIGN KEY (`id_lpj`) REFERENCES `lpjs` (`id_lpj`) ON DELETE CASCADE,
  CONSTRAINT `lpj_items_id_pencairan_item_foreign` FOREIGN KEY (`id_pencairan_item`) REFERENCES `pencairan_dana_items` (`id_pencairan_item`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `lpjs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lpjs` (
  `id_lpj` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_pencairan` bigint unsigned DEFAULT NULL,
  `id_header` bigint unsigned DEFAULT NULL,
  `nomor_lpj` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `judul_lpj` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_lpj` date NOT NULL,
  `tanggal_pelaksanaan_mulai` date DEFAULT NULL,
  `tanggal_pelaksanaan_selesai` date DEFAULT NULL,
  `lokasi_kegiatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ringkasan_kegiatan` text COLLATE utf8mb4_unicode_ci,
  `total_pencairan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_realisasi` decimal(15,2) NOT NULL DEFAULT '0.00',
  `sisa_dana` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status_lpj` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Draft',
  `current_approval_step` int unsigned DEFAULT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `dokumen_bukti` json DEFAULT NULL,
  `diajukan_oleh` bigint unsigned NOT NULL,
  `tanggal_pengajuan` datetime DEFAULT NULL,
  `disetujui_oleh` bigint unsigned DEFAULT NULL,
  `tanggal_persetujuan` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_lpj`),
  UNIQUE KEY `lpjs_uuid_unique` (`uuid`),
  UNIQUE KEY `lpjs_nomor_lpj_unique` (`nomor_lpj`),
  KEY `lpjs_id_pencairan_foreign` (`id_pencairan`),
  KEY `lpjs_diajukan_oleh_foreign` (`diajukan_oleh`),
  KEY `lpjs_disetujui_oleh_foreign` (`disetujui_oleh`),
  KEY `lpjs_id_header_foreign` (`id_header`),
  CONSTRAINT `lpjs_diajukan_oleh_foreign` FOREIGN KEY (`diajukan_oleh`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `lpjs_disetujui_oleh_foreign` FOREIGN KEY (`disetujui_oleh`) REFERENCES `users` (`id_user`) ON DELETE SET NULL,
  CONSTRAINT `lpjs_id_header_foreign` FOREIGN KEY (`id_header`) REFERENCES `rkat_headers` (`id_header`) ON DELETE CASCADE,
  CONSTRAINT `lpjs_id_pencairan_foreign` FOREIGN KEY (`id_pencairan`) REFERENCES `pencairan_danas` (`id_pencairan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pencairan_dana_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pencairan_dana_items` (
  `id_pencairan_item` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_pencairan` bigint unsigned NOT NULL,
  `id_rkat_rab_item` bigint unsigned NOT NULL,
  `volume_pencairan` int NOT NULL DEFAULT '0',
  `volume_pencairan2` decimal(10,2) DEFAULT NULL,
  `nominal_pencairan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `sub_total_pencairan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pencairan_item`),
  UNIQUE KEY `pencairan_dana_items_uuid_unique` (`uuid`),
  KEY `pencairan_dana_items_id_pencairan_foreign` (`id_pencairan`),
  KEY `pencairan_dana_items_id_rkat_rab_item_foreign` (`id_rkat_rab_item`),
  CONSTRAINT `pencairan_dana_items_id_pencairan_foreign` FOREIGN KEY (`id_pencairan`) REFERENCES `pencairan_danas` (`id_pencairan`) ON DELETE CASCADE,
  CONSTRAINT `pencairan_dana_items_id_rkat_rab_item_foreign` FOREIGN KEY (`id_rkat_rab_item`) REFERENCES `rkat_rab_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pencairan_danas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pencairan_danas` (
  `id_pencairan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_header` bigint unsigned NOT NULL,
  `diajukan_oleh` bigint unsigned NOT NULL,
  `status_pencairan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `nama_pencairan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current_step_id` bigint unsigned DEFAULT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `tanggal_pengajuan` datetime DEFAULT NULL,
  `approval_dates` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_pencairan`),
  UNIQUE KEY `pencairan_danas_uuid_unique` (`uuid`),
  KEY `pencairan_danas_id_header_foreign` (`id_header`),
  KEY `pencairan_danas_diajukan_oleh_foreign` (`diajukan_oleh`),
  KEY `pencairan_danas_current_step_id_foreign` (`current_step_id`),
  CONSTRAINT `pencairan_danas_current_step_id_foreign` FOREIGN KEY (`current_step_id`) REFERENCES `approval_path_steps` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pencairan_danas_diajukan_oleh_foreign` FOREIGN KEY (`diajukan_oleh`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `pencairan_danas_id_header_foreign` FOREIGN KEY (`id_header`) REFERENCES `rkat_headers` (`id_header`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rincian_anggarans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rincian_anggarans` (
  `id_rincian_anggaran` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kode_anggaran` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_anggaran` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `satuan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nominal` decimal(15,2) NOT NULL DEFAULT '0.00',
  `kelompok_anggaran` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_rincian_anggaran`),
  UNIQUE KEY `rincian_anggarans_kode_anggaran_unique` (`kode_anggaran`),
  UNIQUE KEY `rincian_anggarans_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rkat_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rkat_details` (
  `id_rkat_detail` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_header` bigint unsigned NOT NULL,
  `judul_kegiatan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi_kegiatan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_iku` bigint unsigned DEFAULT NULL,
  `id_ikk` bigint unsigned DEFAULT NULL,
  `latar_belakang` text COLLATE utf8mb4_unicode_ci,
  `rasional` text COLLATE utf8mb4_unicode_ci,
  `tujuan` text COLLATE utf8mb4_unicode_ci,
  `mekanisme` text COLLATE utf8mb4_unicode_ci,
  `jadwal_pelaksanaan_mulai` date DEFAULT NULL,
  `jadwal_pelaksanaan_akhir` date DEFAULT NULL,
  `lokasi_pelaksanaan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pjawab` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jenis_kegiatan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Rutin',
  `dokumen_pendukung` json DEFAULT NULL,
  `anggaran` decimal(15,2) NOT NULL DEFAULT '0.00',
  `jenis_pencairan` enum('Tunai','Bank') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Tunai',
  `nama_bank` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomor_rekening` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `atas_nama` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_penerima` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_rkat_detail`),
  UNIQUE KEY `rkat_details_uuid_unique` (`uuid`),
  KEY `rkat_details_id_header_foreign` (`id_header`),
  KEY `rkat_details_id_iku_foreign` (`id_iku`),
  KEY `rkat_details_id_ikk_foreign` (`id_ikk`),
  CONSTRAINT `rkat_details_id_header_foreign` FOREIGN KEY (`id_header`) REFERENCES `rkat_headers` (`id_header`) ON DELETE CASCADE,
  CONSTRAINT `rkat_details_id_ikk_foreign` FOREIGN KEY (`id_ikk`) REFERENCES `ikks` (`id_ikk`),
  CONSTRAINT `rkat_details_id_iku_foreign` FOREIGN KEY (`id_iku`) REFERENCES `ikus` (`id_iku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rkat_headers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rkat_headers` (
  `id_header` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun_anggaran` year NOT NULL,
  `id_unit` bigint unsigned NOT NULL,
  `diajukan_oleh` bigint unsigned NOT NULL,
  `nomor_dokumen` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_persetujuan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `current_step_id` bigint unsigned DEFAULT NULL,
  `tanggal_pengajuan` datetime DEFAULT NULL,
  `approval_dates` json DEFAULT NULL,
  `catatan_revisi` text COLLATE utf8mb4_unicode_ci,
  `total_anggaran` decimal(15,2) NOT NULL DEFAULT '0.00',
  `parent_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_header`),
  UNIQUE KEY `rkat_headers_nomor_dokumen_unique` (`nomor_dokumen`),
  UNIQUE KEY `rkat_headers_uuid_unique` (`uuid`),
  KEY `rkat_headers_id_unit_foreign` (`id_unit`),
  KEY `rkat_headers_diajukan_oleh_foreign` (`diajukan_oleh`),
  KEY `rkat_headers_parent_id_foreign` (`parent_id`),
  KEY `rkat_headers_current_step_id_foreign` (`current_step_id`),
  CONSTRAINT `rkat_headers_current_step_id_foreign` FOREIGN KEY (`current_step_id`) REFERENCES `approval_path_steps` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rkat_headers_diajukan_oleh_foreign` FOREIGN KEY (`diajukan_oleh`) REFERENCES `users` (`id_user`),
  CONSTRAINT `rkat_headers_id_unit_foreign` FOREIGN KEY (`id_unit`) REFERENCES `unit` (`id_unit`) ON DELETE CASCADE,
  CONSTRAINT `rkat_headers_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `rkat_headers` (`id_header`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rkat_komentars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rkat_komentars` (
  `id_komentar` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_header` bigint unsigned NOT NULL,
  `id_user` bigint unsigned NOT NULL,
  `pesan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `lampiran_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_komentar`),
  UNIQUE KEY `rkat_komentars_uuid_unique` (`uuid`),
  KEY `rkat_komentars_id_header_foreign` (`id_header`),
  KEY `rkat_komentars_id_user_foreign` (`id_user`),
  CONSTRAINT `rkat_komentars_id_header_foreign` FOREIGN KEY (`id_header`) REFERENCES `rkat_headers` (`id_header`) ON DELETE CASCADE,
  CONSTRAINT `rkat_komentars_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `rkat_rab_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rkat_rab_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_rkat_detail` bigint unsigned NOT NULL,
  `kode_anggaran` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deskripsi_item` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `volume` decimal(10,2) NOT NULL,
  `satuan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `volume2` decimal(10,2) DEFAULT NULL,
  `satuan2` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `sub_total` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rkat_rab_items_uuid_unique` (`uuid`),
  KEY `rkat_rab_items_id_rkat_detail_foreign` (`id_rkat_detail`),
  CONSTRAINT `rkat_rab_items_id_rkat_detail_foreign` FOREIGN KEY (`id_rkat_detail`) REFERENCES `rkat_details` (`id_rkat_detail`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`),
  CONSTRAINT `sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tahun_anggarans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tahun_anggarans` (
  `id_tahun` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tahun_anggaran` year NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_akhir` date NOT NULL,
  `status_rkat` enum('Drafting','Submission','Approved','Closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Drafting',
  `indikator_labels` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_tahun`),
  UNIQUE KEY `tahun_anggarans_tahun_anggaran_unique` (`tahun_anggaran`),
  UNIQUE KEY `tahun_anggarans_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `id_unit` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kode_unit` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_unit` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe_unit` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_path_id` bigint unsigned DEFAULT NULL,
  `pencairan_approval_path_id` bigint unsigned DEFAULT NULL,
  `id_kepala` bigint unsigned DEFAULT NULL,
  `parent_id` bigint unsigned DEFAULT NULL,
  `no_telepon` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_unit`),
  UNIQUE KEY `unit_kode_unit_unique` (`kode_unit`),
  UNIQUE KEY `unit_uuid_unique` (`uuid`),
  KEY `unit_parent_id_foreign` (`parent_id`),
  KEY `unit_id_kepala_foreign` (`id_kepala`),
  KEY `unit_approval_path_id_foreign` (`approval_path_id`),
  KEY `unit_pencairan_approval_path_id_foreign` (`pencairan_approval_path_id`),
  CONSTRAINT `unit_approval_path_id_foreign` FOREIGN KEY (`approval_path_id`) REFERENCES `approval_paths` (`id`) ON DELETE SET NULL,
  CONSTRAINT `unit_id_kepala_foreign` FOREIGN KEY (`id_kepala`) REFERENCES `users` (`id_user`) ON DELETE SET NULL,
  CONSTRAINT `unit_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `unit` (`id_unit`) ON DELETE CASCADE,
  CONSTRAINT `unit_pencairan_approval_path_id_foreign` FOREIGN KEY (`pencairan_approval_path_id`) REFERENCES `approval_paths` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_karyawan` bigint unsigned DEFAULT NULL,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nik` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_lengkap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `peran` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_unit` bigint unsigned DEFAULT NULL,
  `is_aktif` tinyint(1) NOT NULL DEFAULT '1',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `signature_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `no_telepon` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_uuid_unique` (`uuid`),
  UNIQUE KEY `users_id_karyawan_unique` (`id_karyawan`),
  KEY `idx_users_peran` (`peran`),
  KEY `idx_users_id_unit` (`id_unit`),
  CONSTRAINT `users_id_karyawan_foreign` FOREIGN KEY (`id_karyawan`) REFERENCES `karyawans` (`id_karyawan`) ON DELETE SET NULL,
  CONSTRAINT `users_id_unit_foreign` FOREIGN KEY (`id_unit`) REFERENCES `unit` (`id_unit`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'0001_01_01_000000_create_core_identity_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'0001_01_01_000001_create_system_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'2025_10_22_000001_create_rkat_master_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2025_10_22_000002_create_rkat_transaction_tables',2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2026_04_22_152413_add_uuid_to_rkat_headers_table',3);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2026_04_22_165936_add_uuid_to__tables',4);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2026_04_24_083809_update_rkat_workflow_and_phases',5);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2026_04_24_084056_add_revisi_history_to_enum',6);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2026_04_24_140723_update_users_peran_enum_add_tim_renbang',7);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2026_04_24_151050_add_nik_to_users_table',8);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2026_04_24_152331_rename_indicator_columns_in_indikator_keberhasilans_table',9);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2026_04_24_160259_update_status_persetujuan_enum_in_rkat_headers_table',10);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2026_05_06_133934_add_soft_deletes_to_ikus_and_ikks',11);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2026_05_06_134759_add_soft_deletes_to_master_tables',12);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2026_05_18_074129_create_pencairan_danas_table',13);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2026_05_18_082951_add_catatan_to_pencairan_danas_table',14);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18,'2026_05_18_090500_add_approval_dates_to_rkat_headers_table',15);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19,'2026_05_22_150744_create_approval_paths_table',16);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20,'2026_05_22_150745_create_approval_path_steps_table',17);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21,'2026_05_22_150746_alter_tables_for_dynamic_approval',18);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22,'2026_05_23_163941_add_signature_path_to_users_table',19);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23,'2026_05_23_191640_create_pencairan_dana_items_table',20);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24,'2026_05_23_191658_add_nama_pencairan_to_pencairan_danas_table',20);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25,'2026_05_25_155457_update_rkat_headers_approval_dates_column',21);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26,'2026_05_25_160528_update_pencairan_danas_approval_dates_column',22);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (27,'2026_05_25_171929_update_indikator_years_to_be_dynamic',23);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (28,'2026_05_29_104516_add_pencairan_approval_path_id_to_unit_table',24);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (29,'2026_05_30_061046_drop_jalur_persetujuan_from_unit_table',25);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (30,'2026_08_03_000001_create_lpj_tables',26);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (31,'2026_08_12_000001_add_tahun_anggaran_to_ikus_table',27);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (32,'2026_08_12_000002_create_iku_change_logs_table',28);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (33,'2026_08_14_000001_add_id_header_to_lpjs_table',29);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (34,'2026_10_01_000001_create_karyawans_and_rkat_komentars_tables',30);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (35,'2026_10_07_000001_add_second_volume_to_rkat_rab_items',31);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (36,'2026_10_07_000002_create_jenis_kegiatan_options_table',32);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (37,'2026_10_07_000003_add_shared_lpj_approval_path',33);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (38,'2026_10_09_000001_expand_settings_and_user_employee_link',34);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (39,'2026_10_09_000002_consolidate_rektorat_role_and_unit_approvals',35);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (40,'2026_10_10_000001_add_status_kepegawaian_options',36);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (41,'2026_10_13_000001_expand_karyawan_profile_fields',37);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (42,'2026_10_13_000002_remove_unused_karyawan_profile_columns',38);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (43,'2026_10_16_000001_add_second_volume_to_pencairan_items',39);
