<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Teacher;
use Illuminate\Support\Facades\DB;

class DeleteTeacherAction
{
    public function execute(Teacher $teacher): bool
    {
        return DB::transaction(function () use ($teacher): bool {
            $user = $teacher->user;
            $teacher->delete();

            return (bool) $user->delete();
        });
    }
}
