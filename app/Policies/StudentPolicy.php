<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher']);
    }

    public function view(User $user, Student $student): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher']) || $user->id === $student->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->hasRole('admin');
    }
}

