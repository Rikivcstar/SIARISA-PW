<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\PklApplicationStatus;
use App\Models\AcademicYear;
use App\Models\Industry;
use App\Models\IndustrySupervisor;
use App\Models\PklApplication;
use App\Models\PklSupervisor;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class PklApplicationSeeder extends Seeder
{
    public function run(): void
    {
        $activeYear = AcademicYear::where('is_active', true)->first();
        if (! $activeYear) {
            return;
        }

        $students = Student::with('user')->get();
        if ($students->count() < 3) {
            return;
        }

        $industries = Industry::where('is_active', true)->get();
        if ($industries->isEmpty()) {
            return;
        }

        $teacher1 = Teacher::first();
        $indSup1 = IndustrySupervisor::first();

        // 1. Siswa 1: Approved + Supervisor Assigned
        $app1 = PklApplication::firstOrCreate(
            [
                'student_id' => $students[0]->id,
                'academic_year_id' => $activeYear->id,
            ],
            [
                'industry_id' => $industries[0]->id,
                'status' => PklApplicationStatus::Approved,
                'start_date' => '2026-08-01',
                'end_date' => '2026-11-30',
            ]
        );

        if ($teacher1) {
            PklSupervisor::firstOrCreate(
                ['pkl_application_id' => $app1->id],
                [
                    'teacher_id' => $teacher1->id,
                    'industry_supervisor_id' => $indSup1?->id,
                ]
            );
        }

        // 2. Siswa 2: Approved (Belum ada pembimbing sekolah)
        if (isset($students[1])) {
            PklApplication::firstOrCreate(
                [
                    'student_id' => $students[1]->id,
                    'academic_year_id' => $activeYear->id,
                ],
                [
                    'industry_id' => $industries[min(1, $industries->count() - 1)]->id,
                    'status' => PklApplicationStatus::Approved,
                    'start_date' => '2026-08-01',
                    'end_date' => '2026-11-30',
                ]
            );
        }

        // 3. Siswa 3: Submitted (Menunggu Verifikasi)
        if (isset($students[2])) {
            PklApplication::firstOrCreate(
                [
                    'student_id' => $students[2]->id,
                    'academic_year_id' => $activeYear->id,
                ],
                [
                    'industry_id' => $industries[min(2, $industries->count() - 1)]->id,
                    'status' => PklApplicationStatus::Submitted,
                    'start_date' => '2026-08-15',
                    'end_date' => '2026-12-15',
                ]
            );
        }

        // 4. Siswa 4: Rejected (Ditolak dengan alasan)
        if (isset($students[3])) {
            PklApplication::firstOrCreate(
                [
                    'student_id' => $students[3]->id,
                    'academic_year_id' => $activeYear->id,
                ],
                [
                    'industry_id' => $industries[0]->id,
                    'status' => PklApplicationStatus::Rejected,
                    'start_date' => '2026-08-01',
                    'end_date' => '2026-11-30',
                    'rejection_reason' => 'Kuota penempatan untuk jurusan Anda di PT Telkom sudah penuh. Silakan pilih industri mitra lainnya.',
                ]
            );
        }

        $this->command->info('PKL applications seeded.');
    }
}
