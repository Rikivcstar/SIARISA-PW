<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\JournalStatus;
use App\Models\Journal;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ValidateJournalAction
{
    /**
     * @param JournalStatus|string $status
     */
    public function execute(Journal $journal, JournalStatus|string $status, ?string $rejectionReason = null): Journal
    {
        if (is_string($status)) {
            $status = JournalStatus::from($status);
        }

        if ($status === JournalStatus::Rejected && empty(trim($rejectionReason ?? ''))) {
            throw ValidationException::withMessages([
                'rejection_reason' => 'Alasan penolakan wajib diisi jika jurnal ditolak.',
            ]);
        }

        if ($status === JournalStatus::Validated) {
            $journal->update([
                'status' => JournalStatus::Validated,
                'validated_at' => Carbon::now(),
                'rejection_reason' => null,
            ]);
        } else {
            $journal->update([
                'status' => JournalStatus::Rejected,
                'validated_at' => null,
                'rejection_reason' => trim($rejectionReason ?? ''),
            ]);
        }

        return $journal->fresh();
    }
}
