<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClassroomRequest extends FormRequest
{
    public function authorize(): bool
    {
        $classroom = $this->route('classroom');

        return $this->user()?->can('update', $classroom) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $classroomId = $this->route('classroom')?->id;

        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('classrooms', 'name')
                    ->where(fn ($query) => $query->where('academic_year_id', $this->input('academic_year_id')))
                    ->ignore($classroomId),
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
