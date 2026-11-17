<?php

declare(strict_types=1);

namespace App\Http\Requests\Pkl;

use App\Models\Journal;
use Illuminate\Foundation\Http\FormRequest;

class ValidateJournalRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Journal|null $journal */
        $journal = $this->route('journal');

        return $journal ? ($this->user()?->can('validate', $journal) ?? false) : false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'in:validated,rejected'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Keputusan validasi harus dipilih.',
            'status.in' => 'Status validasi harus berupa Validasi Disetujui atau Ditolak.',
            'rejection_reason.required_if' => 'Alasan penolakan / catatan revisi wajib diisi jika jurnal ditolak.',
            'rejection_reason.max' => 'Catatan revisi maksimal 1.000 karakter.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'status' => 'Status Validasi',
            'rejection_reason' => 'Catatan Revisi / Alasan Penolakan',
        ];
    }
}
