<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\JournalStatus;
use App\Models\Journal;
use App\Models\User;

class JournalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'headmaster', 'teacher', 'student', 'industry_supervisor']);
    }

    public function view(User $user, Journal $journal): bool
    {
        if ($user->hasRole(['admin', 'headmaster'])) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $journal->pklApplication?->student?->user_id === $user->id;
        }

        if ($user->hasRole('teacher')) {
            return $journal->pklApplication?->supervisor?->teacher?->user_id === $user->id;
        }

        if ($user->hasRole('industry_supervisor')) {
            return $journal->pklApplication?->supervisor?->industry_supervisor?->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'student']);
    }

    public function update(User $user, Journal $journal): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $journal->pklApplication?->student?->user_id === $user->id
                && $journal->status !== JournalStatus::Validated;
        }

        return false;
    }

    public function delete(User $user, Journal $journal): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $journal->pklApplication?->student?->user_id === $user->id
                && $journal->status === JournalStatus::Pending;
        }

        return false;
    }

    public function validate(User $user, Journal $journal): bool
    {
        if ($user->hasRole(['admin', 'headmaster'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $journal->pklApplication?->supervisor?->teacher?->user_id === $user->id;
        }

        if ($user->hasRole('industry_supervisor')) {
            return $journal->pklApplication?->supervisor?->industry_supervisor?->user_id === $user->id;
        }

        return false;
    }
}
