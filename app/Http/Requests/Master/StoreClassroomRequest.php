<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use App\Models\Classroom;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassroomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Classroom::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('classrooms', 'name')->where(
                    fn ($query) => $query->where('academic_year_id', $this->input('academic_year_id'))
                ),
            ],
            'major_id' => ['required', 'exists:majors,id'],
            'academic_year_id' => ['required', 'exists:academic_years,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama Kelas / Rombel',
            'major_id' => 'Program Keahlian / Jurusan',
            'academic_year_id' => 'Tahun Ajaran',
        ];
    }
}
