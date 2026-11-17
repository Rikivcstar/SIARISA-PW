<?php

declare(strict_types=1);

namespace App\Http\Requests\Pkl;

use App\Models\Attendance;
use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Attendance::class) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'status' => ['required', 'in:present,permission,sick,absent'],
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
            'date.required' => 'Tanggal absensi wajib diisi.',
            'date.date' => 'Format tanggal tidak valid.',
            'status.required' => 'Status kehadiran wajib dipilih.',
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
            'date' => 'Tanggal',
            'status' => 'Status Kehadiran',
            'check_in' => 'Jam Masuk',
            'check_out' => 'Jam Pulang',
            'note' => 'Keterangan',
        ];
    }
}
