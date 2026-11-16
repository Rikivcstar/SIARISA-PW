<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use App\Models\AcademicYear;
use Illuminate\Foundation\Http\FormRequest;

class StoreAcademicYearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', AcademicYear::class) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:20', 'unique:academic_years,name'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama tahun ajaran wajib diisi.',
            'name.string' => 'Nama tahun ajaran harus berupa teks.',
            'name.max' => 'Nama tahun ajaran maksimal 20 karakter.',
            'name.unique' => 'Tahun ajaran ini sudah terdaftar.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Format tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Format tanggal selesai tidak valid.',
            'end_date.after' => 'Tanggal selesai harus setelah tanggal mulai.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama Tahun Ajaran',
            'start_date' => 'Tanggal Mulai',
            'end_date' => 'Tanggal Selesai',
            'is_active' => 'Status Aktif',
        ];
    }
}
