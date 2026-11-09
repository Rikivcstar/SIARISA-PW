<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Teacher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateTeacherAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Teacher $teacher, array $data): Teacher
    {
        return DB::transaction(function () use ($teacher, $data): Teacher {
            $userPayload = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (! empty($data['password'])) {
                $userPayload['password'] = Hash::make($data['password']);
            }

            $teacher->user->update($userPayload);

            $teacher->update([
                'nip' => $data['nip'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            return $teacher;
        });
    }
}
