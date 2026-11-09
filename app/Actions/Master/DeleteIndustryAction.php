<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Industry;

class DeleteIndustryAction
{
    public function execute(Industry $industry): bool
    {
        return (bool) $industry->delete();
    }
}
