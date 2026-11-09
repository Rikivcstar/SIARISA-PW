<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Student $student */
        $student = $this->route('student');

        return $this->user()?->can('update', $student) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        /** @var Student $student */
        $student = $this->route('student');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($student->user_id)],
            'password' => ['nullable', 'string', 'min:8'],
            'nis' => ['required', 'string', 'max:20', Rule::unique('students', 'nis')->ignore($student->id)],
            'nisn' => ['nullable', 'string', 'max:20', Rule::unique('students', 'nisn')->ignore($student->id)],
            'classroom_id' => ['nullable', 'exists:classrooms,id'],
            'major_id' => ['required', 'exists:majors,id'],
            'status' => ['required', 'in:active,inactive,graduated'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama Lengkap Siswa',
            'email' => 'Alamat Email',
            'password' => 'Kata Sandi',
            'nis' => 'Nomor Induk Siswa (NIS)',
            'nisn' => 'Nomor Induk Siswa Nasional (NISN)',
            'classroom_id' => 'Kelas / Rombel',
            'major_id' => 'Program Keahlian / Jurusan',
            'status' => 'Status Siswa',
            'phone' => 'Nomor WhatsApp / Telepon',
            'address' => 'Alamat Domisili',
        ];
    }
}
