<?php

declare(strict_types=1);

namespace App\Actions\Pkl;

use App\Enums\AttendanceStatus;
use App\Models\Attendance;
use App\Models\PklApplication;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class RecordAttendanceAction
{
    /**
     * @param array{
     *     date: string,
     *     status?: AttendanceStatus|string,
     *     check_in?: string|null,
     *     check_out?: string|null,
     *     note?: string|null,
     * } $data
     */
    public function execute(int $pklApplicationId, array $data): Attendance
    {
        $application = PklApplication::find($pklApplicationId);

        if (! $application) {
            throw ValidationException::withMessages([
                'pkl_application_id' => 'Data pengajuan PKL tidak ditemukan.',
            ]);
        }

        $date = Carbon::parse($data['date'])->toDateString();

        // Check if attendance for this date already exists
        $attendance = Attendance::where('pkl_application_id', $pklApplicationId)
            ->whereDate('date', $date)
            ->first();

        $status = $data['status'] ?? AttendanceStatus::Present;
        if (is_string($status)) {
            $status = AttendanceStatus::from($status);
        }

        if ($attendance) {
            // Update existing attendance (e.g. check-out, change note, or update status)
            $updateData = [];

            if (isset($data['status'])) {
                $updateData['status'] = $status;
            }

            if (array_key_exists('check_out', $data) && $data['check_out'] !== null) {
                $updateData['check_out'] = $data['check_out'];
            }

            if (array_key_exists('check_in', $data) && $data['check_in'] !== null) {
                $updateData['check_in'] = $data['check_in'];
            }

            if (array_key_exists('note', $data)) {
                $updateData['note'] = $data['note'];
            }

            $attendance->update($updateData);

            return $attendance->fresh();
        }

        return Attendance::create([
            'pkl_application_id' => $pklApplicationId,
            'date' => $date,
            'status' => $status,
            'check_in' => $data['check_in'] ?? Carbon::now()->format('H:i'),
            'check_out' => $data['check_out'] ?? null,
            'note' => $data['note'] ?? null,
        ]);
    }
}
