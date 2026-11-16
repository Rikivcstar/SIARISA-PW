<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\PklApplicationStatus;
use App\Models\PklApplication;
use Illuminate\Support\Facades\DB;

class RejectPklApplicationAction
{
    public function execute(PklApplication $application, string $reason): PklApplication
    {
        return DB::transaction(function () use ($application, $reason): PklApplication {
            $application->update([
                'status' => PklApplicationStatus::Rejected,
                'rejection_reason' => $reason,
            ]);

            return $application;
        });
    }
}
