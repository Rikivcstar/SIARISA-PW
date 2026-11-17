<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\JournalStatus;
use App\Enums\PklApplicationStatus;
use App\Models\Journal;
use App\Models\PklApplication;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class JournalSeeder extends Seeder
{
    public function run(): void
    {
        $approvedApps = PklApplication::where('status', PklApplicationStatus::Approved)->get();

        if ($approvedApps->isEmpty()) {
            return;
        }

        $now = Carbon::now();

        $sampleActivities = [
            [
                'days_ago' => 8,
                'activity' => 'Orientasi lingkungan kerja industri, pengenalan divisi IT & Design System perusahaan, serta instalasi perangkat lunak standar kerja.',
                'location' => 'Divisi Multimedia & IT Support',
                'status' => JournalStatus::Validated,
                'validated_days_ago' => 7,
                'rejection_reason' => null,
            ],
            [
                'days_ago' => 6,
                'activity' => 'Mempelajari standar brand guidelines industri mitra dan membuat draf wireframe antarmuka banner digital promosi produk.',
                'location' => 'Studio Kreatif DUDI',
                'status' => JournalStatus::Validated,
                'validated_days_ago' => 5,
                'rejection_reason' => null,
            ],
            [
                'days_ago' => 5,
                'activity' => 'Melakukan slicing aset grafis dan optimasi format SVG/WebP untuk kebutuhan implementasi frontend tim pengembang web.',
                'location' => 'Studio Kreatif DUDI',
                'status' => JournalStatus::Validated,
                'validated_days_ago' => 4,
                'rejection_reason' => null,
            ],
            [
                'days_ago' => 3,
                'activity' => 'Membuat desain banner.',
                'location' => 'Divisi Desain',
                'status' => JournalStatus::Rejected,
                'validated_days_ago' => null,
                'rejection_reason' => 'Rincian kegiatan terlalu singkat. Mohon jelaskan software yang digunakan, spesifikasi ukuran banner, dan kendala yang dihadapi saat pengerjaan.',
            ],
            [
                'days_ago' => 2,
                'activity' => 'Membantu tim dokumentasi media sosial dalam photoshoot produk merchandise dan melakukan color grading pada Adobe Lightroom.',
                'location' => 'Studio Foto & Media',
                'status' => JournalStatus::Pending,
                'validated_days_ago' => null,
                'rejection_reason' => null,
            ],
            [
                'days_ago' => 1,
                'activity' => 'Mengerjakan revisi desain feed Instagram korporat serta menyusun aset grafis promosi mingguan sesuai feedback supervisor.',
                'location' => 'Studio Kreatif DUDI',
                'status' => JournalStatus::Pending,
                'validated_days_ago' => null,
                'rejection_reason' => null,
            ],
        ];

        foreach ($approvedApps as $app) {
            foreach ($sampleActivities as $item) {
                $date = $now->copy()->subDays($item['days_ago'])->toDateString();

                Journal::firstOrCreate(
                    [
                        'pkl_application_id' => $app->id,
                        'date' => $date,
                    ],
                    [
                        'activity' => $item['activity'],
                        'location' => $item['location'],
                        'status' => $item['status'],
                        'validated_at' => $item['validated_days_ago'] ? $now->copy()->subDays($item['validated_days_ago']) : null,
                        'rejection_reason' => $item['rejection_reason'],
                    ]
                );
            }
        }
    }
}
