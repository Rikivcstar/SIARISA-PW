<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Classroom;

class CreateClassroomAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Classroom
    {
        return Classroom::create([
            'name' => $data['name'],
            'major_id' => (int) $data['major_id'],
            'academic_year_id' => (int) $data['academic_year_id'],
        ]);
    }
}
