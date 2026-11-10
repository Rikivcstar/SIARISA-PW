<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

class ClassroomPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function update(User $user, Classroom $classroom): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function delete(User $user, Classroom $classroom): bool
    {
        return $user->hasRole('admin');
    }
}
