<?php

declare(strict_types=1);

namespace App\Actions\Master;

use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UpdateStudentAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Student $student, array $data): Student
    {
        return DB::transaction(function () use ($student, $data): Student {
            $userPayload = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (! empty($data['password'])) {
                $userPayload['password'] = Hash::make($data['password']);
            }

            $student->user->update($userPayload);

            $student->update([
                'nis' => $data['nis'],
                'nisn' => $data['nisn'] ?? null,
                'classroom_id' => $data['classroom_id'] ?? null,
                'major_id' => $data['major_id'],
                'status' => $data['status'] ?? 'active',
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            return $student;
        });
    }
}
