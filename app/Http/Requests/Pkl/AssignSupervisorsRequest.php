<?php

declare(strict_types=1);

namespace App\Http\Requests\Pkl;

use App\Models\PklApplication;
use Illuminate\Foundation\Http\FormRequest;

class AssignSupervisorsRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var PklApplication $application */
        $application = $this->route('application');

        return $this->user()?->can('assignSupervisors', $application) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'teacher_id' => ['nullable', 'exists:teachers,id'],
            'industry_supervisor_id' => ['nullable', 'exists:industry_supervisors,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'teacher_id.exists' => 'Guru pembimbing yang dipilih tidak ditemukan.',
            'industry_supervisor_id.exists' => 'Pembimbing industri yang dipilih tidak ditemukan.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'teacher_id' => 'Guru Pembimbing Sekolah',
            'industry_supervisor_id' => 'Pembimbing Industri (DUDI)',
        ];
    }
}
