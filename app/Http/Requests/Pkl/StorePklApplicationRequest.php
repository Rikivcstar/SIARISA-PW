<?php

declare(strict_types=1);

namespace App\Http\Requests\Pkl;

use App\Models\PklApplication;
use Illuminate\Foundation\Http\FormRequest;

class StorePklApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', PklApplication::class) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'industry_id' => ['required', 'exists:industries,id'],
            'student_id' => ['nullable', 'exists:students,id'],
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
            'industry_id.required' => 'Perusahaan / industri mitra wajib dipilih.',
            'industry_id.exists' => 'Industri yang dipilih tidak valid dalam sistem.',
            'student_id.exists' => 'Data siswa tidak ditemukan.',
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
            'industry_id' => 'Industri Mitra',
            'student_id' => 'Siswa PKL',
            'start_date' => 'Tanggal Mulai',
            'end_date' => 'Tanggal Selesai',
        ];
    }
}
