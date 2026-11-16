<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\PklApplicationStatus;
use App\Models\AcademicYear;
use App\Models\PklApplication;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubmitPklApplicationAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(int $studentId, array $data): PklApplication
    {
        return DB::transaction(function () use ($studentId, $data): PklApplication {
            $academicYearId = $data['academic_year_id'] ?? null;

            if (! $academicYearId) {
                $activeYear = AcademicYear::where('is_active', true)->first();
                $academicYearId = $activeYear?->id;
            }

            if (! $academicYearId) {
                throw ValidationException::withMessages([
                    'academic_year_id' => 'Tidak ada tahun ajaran aktif saat ini.',
                ]);
            }

            $existing = PklApplication::where('student_id', $studentId)
                ->where('academic_year_id', $academicYearId)
                ->first();

            if ($existing) {
                if ($existing->status === PklApplicationStatus::Approved) {
                    throw ValidationException::withMessages([
                        'industry_id' => 'Pengajuan PKL Anda pada tahun ajaran ini sudah disetujui.',
                    ]);
                }

                if ($existing->status === PklApplicationStatus::Submitted) {
                    throw ValidationException::withMessages([
                        'industry_id' => 'Anda masih memiliki berkas pengajuan PKL yang sedang menunggu verifikasi.',
                    ]);
                }

                // If previously rejected, update it to re-submit
                $existing->update([
                    'industry_id' => $data['industry_id'],
                    'status' => PklApplicationStatus::Submitted,
                    'start_date' => $data['start_date'] ?? null,
                    'end_date' => $data['end_date'] ?? null,
                    'rejection_reason' => null,
                ]);

                return $existing;
            }

            return PklApplication::create([
                'student_id' => $studentId,
                'industry_id' => $data['industry_id'],
                'academic_year_id' => $academicYearId,
                'status' => PklApplicationStatus::Submitted,
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
            ]);
        });
    }
}
