<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\User;

class AcademicYearPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function update(User $user, AcademicYear $academicYear): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function delete(User $user, AcademicYear $academicYear): bool
    {
        return $user->hasRole('admin');
    }
}

