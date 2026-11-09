<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CreateStudentAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data): Student
    {
        return DB::transaction(function () use ($data): Student {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password'),
            ]);

            $user->assignRole('student');

            return Student::create([
                'user_id' => $user->id,
                'nis' => $data['nis'],
                'nisn' => $data['nisn'] ?? null,
                'classroom_id' => $data['classroom_id'] ?? null,
                'major_id' => $data['major_id'],
                'status' => $data['status'] ?? 'active',
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ]);
        });
    }
}
