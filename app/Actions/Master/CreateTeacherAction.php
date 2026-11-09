<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateTeacherAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Teacher
    {
        return DB::transaction(function () use ($data): Teacher {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password'),
            ]);

            $user->assignRole('teacher');

            return Teacher::create([
                'user_id' => $user->id,
                'nip' => $data['nip'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ]);
        });
    }
}
