<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Models\PklApplication;
use Illuminate\Support\Facades\DB;

class DeletePklApplicationAction
{
    public function execute(PklApplication $application): bool
    {
        return DB::transaction(function () use ($application): bool {
            return (bool) $application->delete();
        });
    }
}

