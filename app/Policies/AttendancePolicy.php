<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher', 'student', 'industry_supervisor']);
    }

    public function view(User $user, Attendance $attendance): bool
    {
        if ($user->hasRole(['admin', 'headmaster'])) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $attendance->pklApplication?->student?->user_id === $user->id;
        }

        if ($user->hasRole('teacher')) {
            return $attendance->pklApplication?->supervisor?->teacher?->user_id === $user->id;
        }

        if ($user->hasRole('industry_supervisor')) {
            return $attendance->pklApplication?->supervisor?->industry_supervisor?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'student']);
    }

    public function update(User $user, Attendance $attendance): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $attendance->pklApplication?->student?->user_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Attendance $attendance): bool
    {
        return $user->hasRole('admin');
    }
}
