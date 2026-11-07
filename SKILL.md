---
name: siarisa-dev
description: Aturan pengembangan proyek SIARISA (Sistem Informasi Manajemen PKL dan PPDB Terintegrasi di SMK Islam Terpadu Ar-Risalah Cariu) dengan Laravel 12/13, Inertia, dan React atau Vue. Gunakan skill ini setiap kali menulis, mengubah, mereview, atau me-refactor kode, migrasi, model, controller, halaman, komponen, test, atau fitur apa pun pada proyek SIARISA, termasuk modul PKL (DUDI, penempatan, absensi, jurnal, monitoring, penilaian), modul PPDB (gelombang, formulir, berkas, verifikasi, pengumuman), dan integrasi siswa. Pakai juga saat diminta membuat kode yang bersih, rapi, ringan, dan mudah dirawat, meskipun pengguna tidak menyebut kata "skill" atau "aturan".
---

# SIARISA Dev Rules

Aturan ini berlaku untuk seluruh kode proyek SIARISA. Tujuannya: kode **bersih, rapi, konsisten, dan ringan** sehingga mudah dirawat dan dikembangkan (misalnya ke modul akademik) tanpa membebani sistem.

Rujukan kebutuhan fitur ada di dokumen **PRD SIARISA**. Jika ada konflik antara kode dan PRD, tanyakan dulu, jangan menebak.

## 1. Prinsip Utama

1. **Sederhana dulu.** Pilih solusi paling sederhana yang memenuhi PRD. Jangan membuat abstraksi, package, atau fitur yang belum diminta.
2. **Satu tanggung jawab.** Satu class, fungsi, atau komponen punya satu tujuan.
3. **Ikuti konvensi Laravel dan starter kit.** Jangan melawan struktur bawaan. Gunakan generator `php artisan make:*`.
4. **Jangan mengulang kode (DRY), tetapi jangan abstraksi terlalu dini.** Ekstrak setelah pola muncul minimal 3 kali.
5. **Jangan menambah dependency baru** tanpa alasan jelas. Utamakan fitur bawaan Laravel dan paket yang sudah disepakati (lihat bagian 10).
6. **Ubah seminimal mungkin.** Saat memperbaiki sesuatu, jangan memformat ulang atau memindahkan file yang tidak terkait.
7. **Kode dalam bahasa Inggris, teks antarmuka dalam bahasa Indonesia.** Nama class, variabel, tabel, kolom, dan route memakai bahasa Inggris. Teks yang dilihat pengguna ditaruh di file bahasa atau konstanta, bukan tersebar di logika.

## 2. Arsitektur Backend

Alur standar: **Route → Controller → Form Request → Action → Model → Resource → Inertia page.**

| Lapisan | Aturan |
|---|---|
| Controller | Tipis. Hanya menerima request, memanggil Action, mengembalikan response. Maksimal 7 method (resource-style). Tidak ada query kompleks atau logika bisnis. |
| Form Request | Semua validasi dan otorisasi awal di sini. Jangan `$request->validate()` di controller. |
| Action / Service | Logika bisnis. Satu Action satu tujuan, satu method publik `handle()`. Letakkan di `app/Actions/{Modul}/`. Pakai `DB::transaction()` untuk proses multi-tabel. |
| Model | Relasi, scope, cast, accessor. Tanpa logika bisnis berat. |
| Policy | Semua aturan akses per model dan role. Panggil lewat `$this->authorize()` atau middleware `can`. |
| Resource | Bentuk data ke frontend. Jangan kirim model mentah. |
| Enum | Status dan tipe (PHP backed enum), di-cast di model. Jangan string ajaib. |

### Aturan penulisan PHP

- Awali file dengan `declare(strict_types=1);`.
- Ikuti PSR-12 dan **Laravel Pint** (jalankan sebelum commit).
- Beri type hint pada parameter, return, dan properti. Hindari `mixed` dan array tanpa bentuk jelas.
- Gunakan `final` pada Action dan class yang tidak diwariskan.
- Gunakan early return, hindari nesting lebih dari 2 tingkat.
- Method maksimal sekitar 20 baris. Class maksimal sekitar 200 baris.
- Komentar menjelaskan **mengapa**, bukan **apa**. Hapus kode yang dikomentari.
- Jangan memakai `env()` di luar file config. Jangan memakai `DB::raw` dengan input pengguna.

### Penamaan

| Hal | Aturan | Contoh |
|---|---|---|
| Model | Singular, PascalCase | `PklPlacement`, `Company` |
| Tabel | Plural, snake_case | `pkl_placements`, `companies` |
| Kolom | snake_case, FK `{model}_id` | `student_id`, `company_id` |
| Controller | `{Model}Controller`, di folder modul | `Pkl/PlacementController` |
| Action | Kata kerja + objek | `ApprovePklApplication`, `ConvertApplicantToStudent` |
| Form Request | `{Aksi}{Model}Request` | `StoreJournalRequest` |
| Enum | Singular, PascalCase, case PascalCase | `JournalStatus::Pending` |
| Route name | `modul.resource.aksi` | `pkl.placements.index` |

## 3. Database dan Performa

1. **Eager loading wajib.** Gunakan `with()` untuk relasi yang dipakai. Aktifkan `Model::preventLazyLoading(! app()->isProduction())` di `AppServiceProvider` agar N+1 ketahuan saat development.
2. **Pagination server-side** untuk semua daftar (`paginate()` atau `simplePaginate()`), jangan `all()` atau `get()` untuk data yang bisa membesar.
3. **Pilih kolom seperlunya** (`select`) pada daftar. Jangan memuat kolom teks panjang jika tidak ditampilkan.
4. **Index** pada kolom yang dipakai `where`, `orderBy`, dan foreign key. Tambahkan unique index untuk aturan unik (misalnya satu siswa satu penempatan aktif per periode).
5. **Foreign key dan integritas.** Gunakan `foreignId()->constrained()` dan tentukan `onDelete` secara sengaja. Gunakan soft delete hanya pada data yang memang perlu dipulihkan.
6. **Migrasi.** Satu perubahan satu migrasi. Jangan mengubah migrasi yang sudah di-commit atau dipakai bersama, buat migrasi baru. Pastikan `down()` benar.
7. **Pencarian dan filter** memakai scope pada model, bukan query berulang di controller.
8. **Proses berat** (ekspor Excel besar, generate PDF massal) dijalankan lewat queue. Gunakan `chunk` atau `lazy` untuk data besar.
9. **Cache** hanya untuk data yang jarang berubah dan sering dibaca (misalnya pengaturan sekolah, daftar jurusan). Jangan cache berlebihan.
10. Gunakan `Model::shouldBeStrict()` pada environment non-produksi untuk menangkap atribut yang salah.

## 4. Keamanan

1. Semua route yang butuh login dilindungi middleware `auth` (dan `verified` bila dipakai). Pisahkan per role dengan middleware role/permission.
2. **Scoping data per role di query, bukan di frontend.** Siswa hanya melihat miliknya, guru hanya siswa bimbingannya, pembimbing industri hanya siswa di DUDI-nya.
3. Gunakan **mass assignment** secara aman: `$fillable` eksplisit, jangan `$guarded = []`. Gunakan `$request->validated()`.
4. **Upload berkas:** validasi tipe (PDF, JPG, PNG) dan ukuran, simpan di disk privat, nama file diacak, sajikan lewat route berotorisasi. Jangan simpan di `public` bila berisi data pribadi.
5. Jangan pernah mencatat password, token, atau data pribadi ke log.
6. Pasang rate limiting pada login, registrasi, dan endpoint upload.
7. Escape output (React dan Vue sudah melakukannya). Jangan pakai `dangerouslySetInnerHTML` atau `v-html` pada data pengguna.
8. Rahasia hanya di `.env`. Jangan commit `.env`, kunci, atau dump database berisi data asli.

## 5. Inertia dan Frontend (React atau Vue)

Pilih **satu** framework (React atau Vue) dan gunakan konsisten di seluruh proyek. Gunakan **TypeScript**.

### Aturan umum

1. **Halaman tipis, komponen kecil.** File halaman (`pages/`) merakit komponen. Satu komponen satu file, usahakan di bawah 150 baris.
2. **Data dari server lewat props Inertia.** Jangan fetch ulang data yang sudah ada di props. Hindari state global kecuali benar-benar perlu.
3. **Form memakai `useForm` Inertia.** Tampilkan error dari server di field terkait, nonaktifkan tombol saat `processing`.
4. **Navigasi memakai `Link` dan `router` Inertia**, bukan `<a href>` untuk halaman internal.
5. **Props yang dikirim seminimal mungkin.** Gunakan Resource di backend. Untuk data besar atau sekunder gunakan `Inertia::defer()` atau optional props, dan partial reload (`only`) saat memperbarui sebagian data.
6. **Pencarian dan filter** memakai `router.get` dengan `preserveState` dan `preserveScroll`, dengan debounce pada input teks.
7. **Hindari re-render dan komputasi berlebihan.** Gunakan memoization (`useMemo`, `computed`) hanya bila ada alasan terukur. Beri `key` stabil pada list.
8. **Code splitting.** Biarkan resolver halaman bawaan starter kit memuat halaman secara lazy. Jangan mengimpor library besar di halaman yang tidak memakainya.
9. **Aksesibilitas dasar:** label pada input, tombol bertipe jelas, kontras warna cukup, dapat dipakai dengan keyboard.
10. **Responsif mobile-first.** Absensi dan jurnal sering dibuka dari HP. Uji tampilan pada layar sempit.
11. Gunakan **komponen UI bawaan starter kit** sebelum membuat komponen baru. Jangan menambah library UI kedua.
12. Hindari `any`. Definisikan tipe data di `resources/js/types/`.

### Penamaan dan struktur frontend

| Hal | Aturan | Contoh |
|---|---|---|
| File halaman dan komponen | Ikuti konvensi starter kit (konsisten, kebab-case atau PascalCase, jangan campur) | `journal-form.tsx` atau `JournalForm.vue` |
| Komponen | PascalCase | `PlacementTable` |
| Hook (React) / Composable (Vue) | Awalan `use` | `useDebouncedSearch` |
| Tipe | PascalCase, di `types/` | `PklPlacement` |
| Fungsi dan variabel | camelCase | `submitJournal` |
| Konstanta | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE_MB` |

Susunan folder:

```
resources/js/
  pages/{pkl,ppdb,master,dashboard}/
  components/{ui,shared}/   # ui = bawaan starter kit, shared = milik proyek
  layouts/
  hooks/ atau composables/
  types/
  lib/                      # fungsi bantu murni
```

### Khusus React

- Hanya function component dan hooks. Ekstrak logika berulang ke custom hook.
- Jangan membuat komponen di dalam komponen lain.
- Hindari `useEffect` untuk hal yang bisa dihitung saat render atau ditangani di event handler.

### Khusus Vue

- Gunakan Composition API dengan `<script setup lang="ts">`.
- Gunakan `defineProps` dan `defineEmits` bertipe. Jangan mengubah props secara langsung.
- Gunakan `computed` untuk nilai turunan, hindari `watch` yang tidak perlu.

## 6. Aturan Domain SIARISA

Aturan bisnis berikut wajib dipatuhi dan diuji.

1. **Role:** `admin`, `headmaster` (kepala sekolah/waka humas), `teacher` (guru pembimbing), `student`, `industry_supervisor`, `applicant`. Kelola dengan spatie/laravel-permission dan Policy.
2. **Satu data induk siswa.** Calon siswa PPDB yang daftar ulang diubah menjadi `Student` lewat `ConvertApplicantToStudent` (dalam transaksi). Dilarang input ulang data yang sudah ada.
3. **Kuota DUDI.** Penempatan tidak boleh melebihi kuota DUDI pada satu periode dan harus sesuai jurusan yang diterima DUDI. Cek di dalam transaksi dengan penguncian agar tidak terjadi penempatan ganda.
4. **Satu penempatan aktif** per siswa per periode PKL (unique index dan validasi).
5. **Status memakai Enum** dan transisi status dikontrol di Action (misalnya pengajuan hanya dari `submitted` ke `approved` atau `rejected`).
6. **Jurnal dan absensi** hanya dapat diisi oleh siswa yang memiliki penempatan aktif, hanya pada rentang tanggal periode PKL, dan tidak dapat diubah setelah divalidasi.
7. **Nilai akhir** = (nilai industri x bobot industri) + (nilai guru x bobot guru). Bobot dibaca dari `settings`, bukan ditulis langsung di kode. Hitung di satu tempat (Action atau Service), bukan di frontend.
8. **Berkas PPDB** bersifat pribadi. Hanya admin dan pemilik berkas yang dapat mengaksesnya.
9. **Tahun ajaran aktif** menjadi konteks default untuk daftar dan laporan.
10. Setiap aksi penting (verifikasi, penempatan, penilaian, hasil seleksi) dicatat ke `activity_logs`.

## 7. Testing

Gunakan **Pest**. Fokus pada alur inti dan aturan domain, bukan mengejar angka cakupan.

1. Setiap Action penting punya test: penempatan (kuota), nilai akhir, konversi calon siswa menjadi siswa, transisi status.
2. Setiap fitur punya Feature test untuk: berhasil, validasi gagal, dan akses ditolak untuk role lain.
3. Gunakan factory dan seeder, bukan data manual. Gunakan `RefreshDatabase`.
4. Satu test satu perilaku. Nama test menjelaskan perilaku, misalnya `it('rejects placement when company quota is full')`.
5. Test harus cepat dan tidak bergantung urutan.

## 8. Git dan Alur Kerja

1. Branch per fitur: `feat/pkl-journal`, `fix/placement-quota`.
2. **Conventional Commits:** `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`. Satu commit satu perubahan logis.
3. Jangan commit file hasil build, `vendor`, `node_modules`, `.env`.
4. Jalankan pemeriksaan sebelum commit (bagian 9).

## 9. Checklist Sebelum Menyatakan Selesai

Jalankan dan pastikan semuanya lulus:

```bash
./vendor/bin/pint            # format PHP
./vendor/bin/phpstan analyse # analisis statis (Larastan)
php artisan test             # Pest
npm run lint                 # ESLint
npm run types                # type check (nama skrip mengikuti starter kit)
npm run build                # build produksi berhasil
```

Lalu periksa:

- [ ] Fitur sesuai kebutuhan di PRD dan skenario Black Box.
- [ ] Validasi input dan otorisasi per role sudah ada.
- [ ] Tidak ada N+1 query, daftar sudah dipaginasi.
- [ ] Tidak ada `dd`, `dump`, `console.log`, atau kode yang dikomentari.
- [ ] Teks antarmuka berbahasa Indonesia dan konsisten.
- [ ] Tampilan benar di HP dan desktop.
- [ ] Test untuk alur inti sudah ditambahkan.

## 10. Stack dan Paket yang Disepakati

| Kebutuhan | Pilihan |
|---|---|
| Framework | Laravel 12 atau 13, PHP 8.3 atau lebih baru |
| Frontend | Inertia.js + React atau Vue 3 (salah satu), TypeScript, starter kit resmi Laravel |
| Role dan izin | spatie/laravel-permission |
| PDF | barryvdh/laravel-dompdf |
| Excel | maatwebsite/excel |
| Test | Pest |
| Kualitas kode | Laravel Pint, Larastan, ESLint, Prettier |

Paket di luar daftar ini perlu alasan tertulis (apa masalahnya, mengapa fitur bawaan tidak cukup).

## 11. Cara Bekerja dengan Skill Ini

Saat diminta membuat atau mengubah fitur:

1. Baca bagian PRD yang relevan dan tentukan modul serta role yang terlibat.
2. Rencanakan singkat: tabel dan migrasi, Action, Form Request, Policy, Resource, route, halaman Inertia, test.
3. Buat dengan generator Artisan, lalu isi sesuai aturan di atas.
4. Jalankan checklist bagian 9.
5. Ringkas perubahan dalam beberapa baris: apa yang dibuat, file yang berubah, dan hal yang perlu diputuskan pengguna.

Jika kebutuhan tidak jelas atau bertentangan dengan PRD, **tanya sebelum menulis kode**.
