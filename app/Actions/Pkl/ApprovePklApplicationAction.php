<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\PklApplicationStatus;
use App\Models\PklApplication;
use Illuminate\Support\Facades\DB;

class ApprovePklApplicationAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(PklApplication $application, array $data = []): PklApplication
    {
        return DB::transaction(function () use ($application, $data): PklApplication {
            $payload = [
                'status' => PklApplicationStatus::Approved,
                'rejection_reason' => null,
            ];

            if (! empty($data['start_date'])) {
                $payload['start_date'] = $data['start_date'];
            }

            if (! empty($data['end_date'])) {
                $payload['end_date'] = $data['end_date'];
            }

            $application->update($payload);

            return $application;
        });
    }
}
