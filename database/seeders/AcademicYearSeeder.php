<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    public function run(): void
    {
        $years = [
            [
                'name'       => '2026/2027',
                'start_date' => '2026-07-14',
                'end_date'   => '2027-06-30',
                'is_active'  => true,
            ],
        ];

        foreach ($years as $year) {
            AcademicYear::firstOrCreate(
                ['name' => $year['name']],
                $year,
            );
        }

        $this->command->info('Academic years seeded.');
    }
}

