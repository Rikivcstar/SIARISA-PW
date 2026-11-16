<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Models\PklApplication;
use App\Models\PklSupervisor;
use Illuminate\Support\Facades\DB;

class AssignPklSupervisorsAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(PklApplication $application, array $data): PklSupervisor
    {
        return DB::transaction(function () use ($application, $data): PklSupervisor {
            return PklSupervisor::updateOrCreate(
                ['pkl_application_id' => $application->id],
                [
                    'teacher_id' => $data['teacher_id'] ?? null,
                    'industry_supervisor_id' => $data['industry_supervisor_id'] ?? null,
                ]
            );
        });
    }
}
