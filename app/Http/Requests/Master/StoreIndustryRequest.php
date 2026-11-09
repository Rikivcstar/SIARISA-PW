<?php

declare(strict_types=1);

namespace App\Http\Requests\Master;

use App\Models\Industry;
use Illuminate\Foundation\Http\FormRequest;

class StoreIndustryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Industry::class) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'address' => ['required', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:100'],
            'contact_person' => ['nullable', 'string', 'max:100'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Nama Industri/DUDI',
            'address' => 'Alamat',
            'city' => 'Kota/Kabupaten',
            'phone' => 'Nomor Telepon Perusahaan',
            'email' => 'Email Perusahaan',
            'contact_person' => 'Nama Kontak Person (PIC)',
            'contact_phone' => 'Nomor Telepon PIC',
            'is_active' => 'Status Kerjasama',
        ];
    }
}
