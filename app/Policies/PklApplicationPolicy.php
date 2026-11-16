<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PklApplicationStatus;
use App\Models\PklApplication;
use App\Models\User;

class PklApplicationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher', 'student']);
    }

    public function view(User $user, PklApplication $application): bool
    {
        if ($user->hasRole(['admin', 'headmaster'])) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $application->student?->user_id === $user->id;
        }

        if ($user->hasRole('teacher')) {
            return $application->supervisor?->teacher?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'student']);
    }

    public function update(User $user, PklApplication $application): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $application->student?->user_id === $user->id
                && $application->status === PklApplicationStatus::Submitted;
        }

        return false;
    }

    public function delete(User $user, PklApplication $application): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $application->student?->user_id === $user->id
                && $application->status === PklApplicationStatus::Submitted;
        }

        return false;
    }

    public function verify(User $user, PklApplication $application): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }

    public function assignSupervisors(User $user, PklApplication $application): bool
    {
        return $user->hasRole(['admin', 'headmaster']);
    }
}

