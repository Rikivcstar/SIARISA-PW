<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\JournalStatus;
use App\Models\Journal;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class UpdateJournalAction
{
    /**
     * @param array{
     *     date?: string,
     *     activity?: string,
     *     location?: string|null,
     * } $data
     */
    public function execute(Journal $journal, array $data): Journal
    {
        if ($journal->status === JournalStatus::Validated) {
            throw ValidationException::withMessages([
                'journal' => 'Jurnal yang sudah divalidasi oleh pembimbing tidak dapat diubah.',
            ]);
        }

        $updateData = [];

        if (isset($data['date'])) {
            $updateData['date'] = Carbon::parse($data['date'])->toDateString();
        }

        if (isset($data['activity'])) {
            $updateData['activity'] = trim($data['activity']);
        }

        if (array_key_exists('location', $data)) {
            $updateData['location'] = $data['location'] !== null ? trim($data['location']) : null;
        }

        // If journal was previously rejected, re-submitting resets it to Pending and clears rejection_reason
        $updateData['status'] = JournalStatus::Pending;
        $updateData['rejection_reason'] = null;
        $updateData['validated_at'] = null;

        $journal->update($updateData);

        return $journal->fresh();
    }
}
