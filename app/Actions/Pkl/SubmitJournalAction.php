<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\JournalStatus;
use App\Models\Journal;
use App\Models\PklApplication;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class SubmitJournalAction
{
    /**
     * @param array{
     *     date: string,
     *     activity: string,
     *     location?: string|null,
     * } $data
     */
    public function execute(int $pklApplicationId, array $data): Journal
    {
        $application = PklApplication::find($pklApplicationId);

        if (! $application) {
            throw ValidationException::withMessages([
                'pkl_application_id' => 'Data pengajuan PKL tidak ditemukan.',
            ]);
        }

        $date = Carbon::parse($data['date'])->toDateString();

        return Journal::create([
            'pkl_application_id' => $pklApplicationId,
            'date' => $date,
            'activity' => trim($data['activity']),
            'location' => isset($data['location']) ? trim($data['location']) : null,
            'status' => JournalStatus::Pending,
            'validated_at' => null,
            'rejection_reason' => null,
        ]);
    }
}
