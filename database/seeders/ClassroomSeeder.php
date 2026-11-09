<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Major;
use Illuminate\Database\Seeder;

class ClassroomSeeder extends Seeder
{
    public function run(): void
    {
        $activeYear = AcademicYear::where('is_active', true)->first();

        if (! $activeYear) {
            $activeYear = AcademicYear::first();
        }

        if (! $activeYear) {
            return;
        }

        $dkv = Major::where('code', 'DKV')->first();
        $mplb = Major::where('code', 'MPLB')->first();
        $lps = Major::where('code', 'LPS')->first();

        $classes = [
            ['name' => 'XI DKV 1', 'major_id' => $dkv?->id],
            ['name' => 'XI DKV 2', 'major_id' => $dkv?->id],
            ['name' => 'XI MPLB 1', 'major_id' => $mplb?->id],
            ['name' => 'XI MPLB 2', 'major_id' => $mplb?->id],
            ['name' => 'XI LPS 1', 'major_id' => $lps?->id],
        ];

        foreach ($classes as $item) {
            if ($item['major_id']) {
                Classroom::firstOrCreate(
                    [
                        'name' => $item['name'],
                        'academic_year_id' => $activeYear->id,
                    ],
                    [
                        'major_id' => $item['major_id'],
                    ]
                );
            }
        }

        $this->command->info('Classrooms seeded.');
    }
}
