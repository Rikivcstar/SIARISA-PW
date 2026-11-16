<?php

declare(strict_types=1);

namespace App\Http\Requests\Pkl;

use App\Models\PklApplication;
use Illuminate\Foundation\Http\FormRequest;

class VerifyPklApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var PklApplication $application */
        $application = $this->route('application');

        return $this->user()?->can('verify', $application) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:approved,rejected'],
            'rejection_reason' => ['nullable', 'required_if:status,rejected', 'string', 'max:1000'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status verifikasi pengajuan wajib dipilih.',
            'status.in' => 'Status harus disetujui (approved) atau ditolak (rejected).',
            'rejection_reason.required_if' => 'Alasan penolakan wajib diisi jika pengajuan ditolak.',
            'rejection_reason.max' => 'Alasan penolakan maksimal 1000 karakter.',
            'start_date.date' => 'Format tanggal mulai tidak valid.',
            'end_date.date' => 'Format tanggal selesai tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai pelaksanaan.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'status' => 'Status Verifikasi',
            'rejection_reason' => 'Alasan Penolakan',
            'start_date' => 'Tanggal Mulai',
            'end_date' => 'Tanggal Selesai',
        ];
    }
}
