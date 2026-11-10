<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Teacher;
use App\Models\User;

class TeacherPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher']);
    }

    public function view(User $user, Teacher $teacher): bool
    {
        return $user->hasRole(['admin', 'headmaster']) || $user->id === $teacher->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function update(User $user, Teacher $teacher): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function delete(User $user, Teacher $teacher): bool
    {
        return $user->hasRole('admin');
    }
}
