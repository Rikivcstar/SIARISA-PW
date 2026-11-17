<?php

declare(strict_types=1);

namespace App\Http\Requests\Pkl;

use App\Models\Journal;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJournalRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Journal|null $journal */
        $journal = $this->route('journal');

        return $journal ? ($this->user()?->can('update', $journal) ?? false) : false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'date' => ['nullable', 'date'],
            'activity' => ['required', 'string', 'min:10', 'max:3000'],
            'location' => ['nullable', 'string', 'max:150'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date.date' => 'Format tanggal tidak valid.',
            'activity.required' => 'Rincian kegiatan harian PKL wajib diisi.',
            'activity.min' => 'Rincian kegiatan minimal 10 karakter.',
            'activity.max' => 'Rincian kegiatan maksimal 3.000 karakter.',
            'location.max' => 'Nama lokasi/divisi penugasan maksimal 150 karakter.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'date' => 'Tanggal Kegiatan',
            'activity' => 'Rincian Kegiatan',
            'location' => 'Lokasi / Divisi',
        ];
    }
}
