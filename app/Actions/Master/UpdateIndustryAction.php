<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Industry;

class UpdateIndustryAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Industry $industry, array $data): Industry
    {
        $industry->update([
            'name' => $data['name'],
            'address' => $data['address'],
            'city' => $data['city'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'contact_person' => $data['contact_person'] ?? null,
            'contact_phone' => $data['contact_phone'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? $industry->is_active),
        ]);

        return $industry;
    }
}
