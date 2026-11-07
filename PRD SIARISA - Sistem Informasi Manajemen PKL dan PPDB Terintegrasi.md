# PRD SIARISA

Product Requirements Document: Sistem Informasi Manajemen PKL dan PPDB Terintegrasi Berbasis Web di SMK Islam Terpadu Ar-Risalah Cariu

| Item | Keterangan |
| --- | --- |
| Nama produk | SIARISA (Sistem Informasi Ar-Risalah) |
| Jenis | Project Work / Skripsi Informatika |
| Periode pengerjaan | November 2026 sampai Maret 2027 (5 bulan) |
| Output | Aplikasi web dan Hak Kekayaan Intelektual (HAKI) |
| Versi dokumen | 1.0 (draf awal, perlu divalidasi dengan pihak sekolah) |

## 1. Ringkasan Produk

SIARISA adalah aplikasi web untuk mengelola Praktik Kerja Lapangan (PKL) secara terstruktur, mulai dari pendataan industri mitra (DUDI), pengajuan dan penempatan, absensi dan jurnal harian, monitoring, hingga penilaian dan laporan. Aplikasi dilengkapi modul Penerimaan Peserta Didik Baru (PPDB) yang terhubung dalam satu basis data, sehingga calon siswa yang diterima otomatis menjadi data induk siswa yang dipakai sampai tahap PKL.

**Fokus utama:** modul PKL. **Pendukung:** modul PPDB dengan cakupan lebih sederhana.

## 2. Latar Belakang dan Tujuan

### Masalah yang diselesaikan

(Validasi dengan observasi dan wawancara di sekolah.)

- Data DUDI, penempatan, absensi, jurnal, dan nilai PKL tersebar dan sulit direkap.
- Guru pembimbing sulit memantau siswa yang berada di lokasi PKL.
- Data calon siswa dari PPDB tidak otomatis menjadi data siswa sehingga terjadi pendataan berulang.
- Website sekolah saat ini berfungsi sebagai media informasi dan belum mengelola proses PKL.

### Tujuan produk

1. Membangun sistem PKL berbasis web yang mengelola penempatan, absensi, jurnal, monitoring, dan penilaian.
2. Membangun modul PPDB yang terintegrasi dengan sistem PKL dalam satu basis data siswa.
3. Menguji sistem agar sesuai kebutuhan pengguna.

### Indikator keberhasilan

| Indikator | Target |
| --- | --- |
| Seluruh fitur prioritas Wajib berjalan sesuai skenario uji | 100% lolos Black Box Testing |
| Skor kepuasan pengguna (SUS) | 68 atau lebih (kategori cukup baik) |
| Waktu muat halaman utama pada jaringan 4G | kurang dari 3 detik |
| Rekap nilai PKL satu kelas | dapat dihasilkan dalam kurang dari 1 menit |
| Data siswa PPDB menjadi data siswa PKL | tanpa input ulang |

## 3. Ruang Lingkup

### Dalam lingkup (In Scope)

- Modul umum: autentikasi, role, dashboard, data master.
- Modul PKL lengkap (fokus utama).
- Modul PPDB: gelombang, pendaftaran, upload berkas, verifikasi, pengumuman, daftar ulang.
- Integrasi data calon siswa menjadi data siswa.
- Cetak dokumen (surat, bukti pendaftaran, sertifikat) dan ekspor laporan PDF/Excel.
- Notifikasi dalam aplikasi dan email.

### Di luar lingkup (Out of Scope)

- Modul akademik (nilai rapor, jadwal pelajaran, dan sejenisnya).
- Seleksi PPDB berbasis tes atau algoritma kompleks.
- Pembayaran online.
- Aplikasi mobile native.
- Notifikasi WhatsApp dan rekomendasi penempatan (SAW), dicatat sebagai pengembangan selanjutnya.

## 4. Aktor dan Hak Akses

| Aktor | Deskripsi | Hak akses utama |
| --- | --- | --- |
| Admin | Operator sekolah | Seluruh data master, DUDI, verifikasi, laporan, pengaturan |
| Kepala Sekolah / Waka Humas | Pimpinan dan hubin | Dashboard, persetujuan penempatan, laporan (baca) |
| Guru Pembimbing | Pembimbing PKL | Monitoring siswa bimbingan, validasi jurnal, kunjungan, penilaian |
| Siswa | Siswa aktif | Pengajuan PKL, absensi, jurnal, laporan akhir, lihat nilai |
| Pembimbing Industri | Perwakilan DUDI | Validasi jurnal, penilaian siswa di tempatnya |
| Calon Siswa | Pendaftar PPDB | Registrasi, formulir, upload berkas, lihat hasil |

## 5. Alur Bisnis Utama

### 5.1 Alur PKL

1. Admin membuat periode PKL dan data DUDI (kuota, jurusan yang diterima).
2. Siswa mengajukan tempat PKL (memilih DUDI mitra atau mengusulkan DUDI baru).
3. Admin atau Waka Humas memverifikasi pengajuan, lalu menyetujui atau menolak.
4. Sistem menetapkan penempatan (cek kuota dan kesesuaian jurusan) dan guru pembimbing.
5. Sistem mencetak surat pengantar dan surat tugas.
6. Selama PKL, siswa mengisi absensi dan jurnal harian. Pembimbing industri dan guru memvalidasi jurnal.
7. Guru melakukan kunjungan dan mencatat hasil monitoring.
8. Pembimbing industri dan guru mengisi penilaian. Sistem menghitung nilai akhir.
9. Siswa mengunggah laporan akhir. Admin mencetak sertifikat atau surat keterangan dan rekap nilai.

### 5.2 Alur PPDB

1. Admin membuka gelombang dan mengatur kuota per jurusan.
2. Calon siswa registrasi akun, mengisi formulir, dan mengunggah berkas.
3. Admin memverifikasi berkas (diterima, ditolak, atau perlu perbaikan).
4. Admin menetapkan hasil seleksi dan mengumumkan.
5. Calon siswa yang diterima melakukan daftar ulang dan mencetak bukti.
6. Sistem membuat data siswa dari data calon siswa (integrasi).

## 6. Kebutuhan Fungsional

Prioritas: **W** = Wajib, **S** = Sebaiknya ada, **O** = Opsional.

### 6.1 Umum (UM)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| UM-01 | Login dan logout berbasis role | W |
| UM-02 | Ubah password dan kelola profil | W |
| UM-03 | Dashboard sesuai role | W |
| UM-04 | CRUD data master: tahun ajaran, jurusan (DKV, MPLB, LPS), kelas, siswa, guru | W |
| UM-05 | Pengaturan identitas sekolah | S |
| UM-06 | Manajemen akun pengguna dan penetapan role oleh admin | W |
| UM-07 | Notifikasi dalam aplikasi | S |
| UM-08 | Log aktivitas pengguna | S |

### 6.2 Modul PKL (PK)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| PK-01 | CRUD data DUDI (nama, alamat, bidang usaha, kuota, kontak, status kerja sama) | W |
| PK-02 | CRUD pembimbing industri dan akun login-nya | W |
| PK-03 | CRUD periode PKL | W |
| PK-04 | Pengajuan tempat PKL oleh siswa | W |
| PK-05 | Verifikasi pengajuan (setuju, tolak, catatan) | W |
| PK-06 | Penempatan siswa dengan validasi kuota dan kesesuaian jurusan | W |
| PK-07 | Penetapan guru pembimbing | W |
| PK-08 | Cetak surat pengantar dan surat tugas pembimbing | S |
| PK-09 | Absensi harian siswa (masuk, pulang, status hadir/izin/sakit) | W |
| PK-10 | Validasi lokasi absensi (geolocation) | O |
| PK-11 | Jurnal kegiatan harian siswa | W |
| PK-12 | Validasi jurnal oleh pembimbing industri dan guru | W |
| PK-13 | Catatan kunjungan monitoring guru | W |
| PK-14 | Dashboard rekap kehadiran dan progres PKL | S |
| PK-15 | Penilaian oleh pembimbing industri | W |
| PK-16 | Penilaian oleh guru pembimbing | W |
| PK-17 | Perhitungan nilai akhir otomatis dengan bobot yang dapat diatur | W |
| PK-18 | Upload laporan akhir PKL | W |
| PK-19 | Cetak sertifikat atau surat keterangan PKL dan rekap nilai | S |
| PK-20 | Ekspor laporan PKL (PDF dan Excel) | S |

### 6.3 Modul PPDB (PP)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| PP-01 | Pengelolaan gelombang dan kuota per jurusan | W |
| PP-02 | Registrasi dan login calon siswa | W |
| PP-03 | Formulir pendaftaran (biodata, orang tua, asal sekolah, pilihan jurusan) | W |
| PP-04 | Upload berkas (KK, akta, ijazah/SKL, foto) dengan validasi tipe dan ukuran | W |
| PP-05 | Verifikasi berkas oleh admin (diterima, ditolak, perlu perbaikan) | W |
| PP-06 | Penetapan hasil seleksi dan pengumuman | W |
| PP-07 | Daftar ulang dan cetak bukti pendaftaran | S |
| PP-08 | Laporan dan ekspor data pendaftar | S |

### 6.4 Integrasi (IN)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| IN-01 | Calon siswa yang daftar ulang otomatis menjadi data siswa (tanpa input ulang) | W |
| IN-02 | Satu tabel induk siswa dipakai oleh PPDB dan PKL | W |
| IN-03 | Dashboard terpusat: jumlah pendaftar, siswa PKL, DUDI mitra | S |

## 7. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Kinerja | Halaman utama dimuat kurang dari 3 detik pada 4G. Daftar data memakai pagination server-side. |
| Keamanan | Hash password (bcrypt/argon2), proteksi CSRF, validasi input di server, otorisasi per role dengan policy, rate limiting login, upload file diverifikasi tipe dan ukuran. |
| Privasi | Data pribadi calon siswa hanya dapat diakses admin dan pemilik data. Berkas disimpan di storage privat. |
| Kegunaan | Responsif di HP dan desktop. Diuji dengan SUS. |
| Keandalan | Backup basis data berkala. Transaksi database untuk proses kritis (penempatan, konversi calon siswa menjadi siswa). |
| Kemudahan perawatan | Kode mengikuti standar pada SKILL.md, dengan pengujian otomatis pada alur inti. |
| Kompatibilitas | Chrome, Edge, Firefox, dan Safari versi terbaru. |

## 8. Tech Stack dan Arsitektur

### Tech stack

| Lapisan | Teknologi |
| --- | --- |
| Backend | Laravel 12 atau 13 (PHP 8.3 atau lebih baru) |
| Frontend | Inertia.js dengan React atau Vue 3 (pilih satu dan konsisten), TypeScript |
| Starter kit | Starter kit resmi Laravel untuk React atau Vue (Inertia) |
| Styling | Tailwind CSS dan komponen UI bawaan starter kit |
| Database | MySQL 8 atau MariaDB |
| Role dan izin | spatie/laravel-permission |
| Cetak PDF | barryvdh/laravel-dompdf |
| Ekspor Excel | maatwebsite/excel |
| Antrean dan cache | Database queue dan cache (cukup untuk skala sekolah) |
| Testing | Pest |
| Kualitas kode | Laravel Pint, Larastan (PHPStan), ESLint, Prettier |
| Version control | Git dengan Conventional Commits |

### Arsitektur

Arsitektur monolit Laravel dengan Inertia. Controller dibuat tipis. Logika bisnis berada di Action atau Service class. Validasi memakai Form Request, otorisasi memakai Policy, dan data dikirim ke frontend melalui API Resource atau DTO agar hanya field yang dibutuhkan yang terkirim.

| Lapisan | Tanggung jawab |
| --- | --- |
| Routes | Pemetaan URL, dikelompokkan per modul dan role |
| Controller | Menerima request, memanggil Action, mengembalikan Inertia response |
| Form Request | Validasi dan otorisasi awal |
| Action / Service | Logika bisnis (satu tujuan per class) |
| Model | Relasi, scope, cast. Tanpa logika bisnis berat |
| Policy | Aturan akses per model dan role |
| Resource | Bentuk data yang dikirim ke halaman Inertia |
| Pages (frontend) | Halaman Inertia per modul |
| Components | Komponen UI yang dapat dipakai ulang |

### Struktur folder (disarankan)

```
app/
  Actions/{Pkl,Ppdb,Master}/
  Enums/
  Http/Controllers/{Pkl,Ppdb,Master}/
  Http/Requests/
  Http/Resources/
  Models/
  Policies/
  Services/
resources/js/
  pages/{pkl,ppdb,master,dashboard}/
  components/{ui,shared}/
  layouts/
  hooks/ (React) atau composables/ (Vue)
  types/
  lib/
database/{migrations,factories,seeders}/
tests/{Feature,Unit}/
```

## 9. Rancangan Data

### Entitas utama

| Tabel | Isi utama |
| --- | --- |
| users | Akun login (nama, email, password) dan role |
| academic\_years | Tahun ajaran, status aktif |
| majors | Jurusan (DKV, MPLB, LPS) |
| classrooms | Kelas, jurusan, tahun ajaran |
| students | Data induk siswa (NIS, NISN, kelas, jurusan, status), relasi ke users dan ppdb\_applicants |
| teachers | Data guru |
| companies | DUDI: nama, alamat, bidang usaha, kuota, status kerja sama |
| industry\_supervisors | Pembimbing industri, relasi ke companies dan users |
| pkl\_periods | Periode PKL: tanggal mulai dan selesai, status |
| pkl\_applications | Pengajuan PKL: siswa, DUDI, periode, status, catatan |
| pkl\_placements | Penempatan: siswa, DUDI, guru pembimbing, pembimbing industri |
| attendances | Absensi: penempatan, tanggal, jam masuk dan pulang, status, koordinat (opsional) |
| journals | Jurnal: penempatan, tanggal, kegiatan, status validasi |
| visits | Kunjungan monitoring: penempatan, guru, tanggal, catatan |
| assessments | Penilaian: penempatan, penilai (industri atau guru), komponen, nilai |
| pkl\_reports | Laporan akhir: penempatan, file, status |
| ppdb\_waves | Gelombang PPDB, kuota per jurusan, periode |
| ppdb\_applicants | Calon siswa: biodata, orang tua, asal sekolah, pilihan jurusan, status |
| ppdb\_documents | Berkas calon siswa, status verifikasi, catatan |
| settings | Identitas sekolah dan bobot penilaian |
| activity\_logs | Jejak aktivitas |

### Relasi kunci

- students 1 ke N pkl\_applications, dan satu siswa memiliki satu penempatan aktif per periode.
- pkl\_placements 1 ke N attendances, journals, visits, dan assessments.
- companies 1 ke N industry\_supervisors dan pkl\_placements. Jumlah penempatan per periode tidak boleh melebihi kuota.
- ppdb\_applicants 1 ke 1 students (dibuat saat daftar ulang).

### Status (gunakan PHP Enum)

| Entitas | Status |
| --- | --- |
| pkl\_applications | diajukan, disetujui, ditolak |
| journals | menunggu, divalidasi, ditolak |
| attendances | hadir, izin, sakit, alpa |
| ppdb\_applicants | terdaftar, berkas\_diverifikasi, perlu\_perbaikan, diterima, tidak\_diterima, daftar\_ulang |
| ppdb\_documents | menunggu, diterima, ditolak |

### Perhitungan nilai akhir

Nilai akhir = (nilai pembimbing industri x bobot industri) + (nilai guru pembimbing x bobot guru). Bobot default **\[60% industri dan 40% guru, sesuaikan dengan ketentuan sekolah\]** dan disimpan di tabel settings. Komponen penilaian mengikuti format penilaian PKL sekolah.

## 10. Halaman Utama per Modul

| Modul | Halaman |
| --- | --- |
| Autentikasi | Login, lupa password, profil |
| Dashboard | Dashboard admin, kepala sekolah, guru, siswa, pembimbing industri |
| Master | Tahun ajaran, jurusan, kelas, siswa, guru, pengguna, pengaturan |
| PKL admin | DUDI, pembimbing industri, periode, pengajuan, penempatan, rekap absensi, rekap nilai, laporan |
| PKL siswa | Pengajuan, absensi, jurnal, laporan akhir, nilai |
| PKL guru dan industri | Daftar siswa bimbingan, validasi jurnal, kunjungan, form penilaian |
| PPDB admin | Gelombang, daftar pendaftar, verifikasi berkas, hasil seleksi, laporan |
| PPDB calon siswa | Registrasi, formulir, upload berkas, status, pengumuman, daftar ulang, cetak bukti |

## 11. Keamanan dan Privasi

- Semua route dilindungi middleware autentikasi dan Policy per role.
- Siswa hanya melihat data miliknya, guru hanya siswa bimbingannya, pembimbing industri hanya siswa di DUDI-nya.
- Berkas PPDB disimpan di disk privat dan diakses lewat route berotorisasi, bukan URL publik.
- Upload dibatasi tipe (PDF, JPG, PNG) dan ukuran, nama file diacak.
- Konfigurasi sensitif hanya di file .env dan tidak masuk repositori.
- Rate limiting pada login dan registrasi.

## 12. Strategi Pengujian

| Jenis | Cakupan |
| --- | --- |
| Unit dan Feature test (Pest) | Action inti: penempatan, kuota, nilai akhir, konversi calon siswa menjadi siswa, otorisasi per role |
| Black Box Testing | Seluruh fitur Wajib dengan skenario input dan hasil yang diharapkan |
| UAT | Pengguna nyata (admin, guru, siswa, pembimbing industri) menjalankan skenario kerja |
| SUS | Kuesioner 10 pernyataan kepada responden, target skor 68 atau lebih |

## 13. Rencana Pengerjaan (Nov 2026 sampai Mar 2027)

| Bulan | Kegiatan | Hasil |
| --- | --- | --- |
| November 2026 | Observasi, wawancara, analisis kebutuhan, finalisasi PRD, desain UML dan ERD, setup proyek | Dokumen kebutuhan, ERD, repo siap |
| Desember 2026 | Modul umum (auth, role, master), modul DUDI dan periode PKL, desain antarmuka | Fondasi sistem berjalan |
| Januari 2027 | Modul PKL: pengajuan, penempatan, absensi, jurnal, monitoring | Alur PKL inti selesai |
| Februari 2027 | Penilaian, laporan, cetak dokumen, modul PPDB, integrasi data | Seluruh fitur Wajib selesai |
| Maret 2027 | Pengujian (Black Box, UAT, SUS), perbaikan, deploy, pendaftaran HAKI, penyusunan laporan | Sistem final dan laporan |

## 14. Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Kebutuhan sekolah berubah | Validasi PRD di awal dan kunci ruang lingkup. Fitur baru masuk daftar pengembangan lanjutan. |
| Cakupan terlalu luas untuk 5 bulan | Kerjakan fitur Wajib lebih dahulu. Fitur Opsional hanya jika waktu cukup. |
| Data nyata sekolah sulit didapat | Siapkan seeder data contoh agar pengembangan tidak tertunda. |
| Pengguna kurang familiar | Antarmuka sederhana, panduan singkat, dan sesi pelatihan. |
| Kehilangan data | Backup basis data terjadwal dan migrasi yang terkontrol. |
| Pembimbing industri jarang membuka sistem | Tampilan validasi dan penilaian dibuat singkat dan ramah HP. Tambahkan notifikasi email. |

## 15. Kriteria Penerimaan (Definition of Done)

Sebuah fitur dinyatakan selesai jika:

1. Berjalan sesuai skenario pada PRD dan lolos Black Box Testing.
2. Memiliki validasi input dan otorisasi per role.
3. Memiliki Feature test untuk alur inti dan semua test lulus.
4. Lolos Pint, Larastan, ESLint, dan type check tanpa error.
5. Tampil benar di HP dan desktop.
6. Tidak ada query N+1 pada halaman daftar.

## 16. Pengembangan Selanjutnya

- Notifikasi WhatsApp otomatis.
- Validasi absensi dengan geolocation (jika belum dikerjakan).
- Rekomendasi penempatan DUDI dengan metode SAW atau Profile Matching.
- Modul akademik dan alumni (pelacakan lulusan).

## 17. Referensi Aturan Kode

Standar penulisan kode, penamaan, struktur, dan performa dijelaskan pada berkas **SKILL.md** yang menyertai dokumen ini dan menjadi acuan seluruh pengembangan SIARISA.
