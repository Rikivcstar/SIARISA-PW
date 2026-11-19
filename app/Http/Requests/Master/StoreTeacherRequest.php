<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use App\Models\Teacher;
use Illuminate\Foundation\Http\FormRequest;
use Override;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Teacher::class) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'nip' => ['required', 'string', 'max:30', 'unique:teachers,nip'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama Lengkap Guru',
            'email' => 'Alamat Email',
            'password' => 'Kata Sandi',
            'nip' => 'Nomor Induk Pegawai (NIP)',
            'phone' => 'Nomor WhatsApp / Telepon',
            'address' => 'Alamat Rumah',
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'name.required' => 'kolom nama tidak boleh kosong',
            'email.required' => 'kolom email tidak boleh kosong',
            'nip.required' => 'kolom nip tidak boleh kosong',
            'password.required' => 'kolom password tidak boleh kosong',
            'phone.required' => 'kolom telepon/Wa tidak boleh kosong'
        ];
    }
}
