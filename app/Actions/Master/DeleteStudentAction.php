<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Student;
use Illuminate\Support\Facades\DB;

class DeleteStudentAction
{
    public function execute(Student $student): bool
    {
        return DB::transaction(function () use ($student): bool {
            $user = $student->user;
            $student->delete();

            return (bool) $user->delete();
        });
    }
}
