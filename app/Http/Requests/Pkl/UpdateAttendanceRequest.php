<?php

declare(strict_types=1);

namespace App\Http\Requests\Pkl;

use App\Models\Attendance;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Attendance|null $attendance */
        $attendance = $this->route('attendance');

        return $attendance ? ($this->user()?->can('update', $attendance) ?? false) : false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'status' => ['nullable', 'in:present,permission,sick,absent'],
            'check_in' => ['nullable', 'string'],
            'check_out' => ['nullable', 'string'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.in' => 'Status kehadiran harus salah satu dari: Hadir, Izin, Sakit, atau Alpa.',
            'note.max' => 'Catatan keterangan maksimal 500 karakter.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'status' => 'Status Kehadiran',
            'check_in' => 'Jam Masuk',
            'check_out' => 'Jam Pulang',
            'note' => 'Keterangan',
        ];
    }
}
