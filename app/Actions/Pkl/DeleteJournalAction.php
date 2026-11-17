<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\JournalStatus;
use App\Models\Journal;
use Illuminate\Validation\ValidationException;

class DeleteJournalAction
{
    public function execute(Journal $journal): void
    {
        if ($journal->status === JournalStatus::Validated) {
            throw ValidationException::withMessages([
                'journal' => 'Jurnal yang sudah tervalidasi tidak dapat dihapus.',
            ]);
        }

        $journal->delete();
    }
}
