<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\AcademicYear;
use Illuminate\Support\Facades\DB;

class ToggleActiveAcademicYearAction
{
    public function execute(AcademicYear $academicYear): AcademicYear
    {
        return DB::transaction(function () use ($academicYear): AcademicYear {
            // Deactivate all others
            AcademicYear::where('id', '!=', $academicYear->id)
                ->update(['is_active' => false]);

            $academicYear->update(['is_active' => true]);

            return $academicYear;
        });
    }
}
