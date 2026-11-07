<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // ─── Identitas Sekolah ────────────────────────────────────────
            [
                'key'         => 'school_name',
                'value'       => 'SMK Islam Terpadu Ar-Risalah Cariu',
                'description' => 'Nama lengkap sekolah',
            ],
            [
                'key'         => 'school_short_name',
                'value'       => 'SMK IT Ar-Risalah',
                'description' => 'Nama singkat sekolah',
            ],
            [
                'key'         => 'school_address',
                'value'       => 'Cariu, Bogor, Jawa Barat',
                'description' => 'Alamat sekolah',
            ],
            [
                'key'         => 'school_phone',
                'value'       => '',
                'description' => 'Nomor telepon sekolah',
            ],
            [
                'key'         => 'school_email',
                'value'       => '',
                'description' => 'Email sekolah',
            ],
            [
                'key'         => 'school_npsn',
                'value'       => '',
                'description' => 'Nomor Pokok Sekolah Nasional',
            ],
            [
                'key'         => 'foundation_name',
                'value'       => 'Yayasan Ar-Risalah Jakarta',
                'description' => 'Nama yayasan',
            ],

            // ─── Bobot Nilai PKL ──────────────────────────────────────────
            [
                'key'         => 'pkl_grade_weight_industry',
                'value'       => '60',
                'description' => 'Bobot nilai PKL dari pembimbing industri (dalam persen)',
            ],
            [
                'key'         => 'pkl_grade_weight_teacher',
                'value'       => '40',
                'description' => 'Bobot nilai PKL dari guru pembimbing (dalam persen)',
            ],

            // ─── Sistem ───────────────────────────────────────────────────
            [
                'key'         => 'system_name',
                'value'       => 'SIARISA',
                'description' => 'Nama sistem',
            ],
            [
                'key'         => 'system_full_name',
                'value'       => 'Sistem Informasi Manajemen PKL Terintegrasi PPDB',
                'description' => 'Nama lengkap sistem',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                $setting,
            );
        }

        $this->command->info('Settings seeded (' . count($settings) . ' records).');
    }
}

