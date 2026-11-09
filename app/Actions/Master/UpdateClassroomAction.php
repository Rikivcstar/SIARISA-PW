<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Classroom;

class UpdateClassroomAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Classroom $classroom, array $data): Classroom
    {
        $classroom->update([
            'name' => $data['name'],
            'major_id' => (int) $data['major_id'],
            'academic_year_id' => (int) $data['academic_year_id'],
        ]);

        return $classroom;
    }
}
