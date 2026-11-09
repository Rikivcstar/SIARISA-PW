<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Major;
use Illuminate\Database\Seeder;

class MajorSeeder extends Seeder
{
    public function run(): void
    {
        $majors = [
            ['name' => 'Desain Komunikasi Visual',       'code' => 'DKV'],
            ['name' => 'Manajemen Perkantoran dan Layanan Bisnis', 'code' => 'MPLB'],
            ['name' => 'Layanan Perbankan Syariah',      'code' => 'LPS'],
        ];

        foreach ($majors as $major) {
            Major::firstOrCreate(
                ['code' => $major['code']],
                $major,
            );
        }

        $this->command->info('Majors seeded: DKV, MPLB, LPS.');
    }
}
