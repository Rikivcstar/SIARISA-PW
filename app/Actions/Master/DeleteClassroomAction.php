<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Classroom;

class DeleteClassroomAction
{
    public function execute(Classroom $classroom): bool
    {
        return (bool) $classroom->delete();
    }
}

