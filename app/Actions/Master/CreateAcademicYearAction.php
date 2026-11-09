<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\AcademicYear;

class CreateAcademicYearAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): AcademicYear
    {
        return AcademicYear::create([
            'name' => $data['name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);
    }
}
