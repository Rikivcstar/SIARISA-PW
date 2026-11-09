<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $address
 * @property string|null $city
 * @property string|null $phone
 * @property string|null $email
 * @property string|null $contact_person
 * @property string|null $contact_phone
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Industry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'phone',
        'email',
        'contact_person',
        'contact_phone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function supervisors(): HasMany
    {
        return $this->hasMany(IndustrySupervisor::class);
    }

    public function pklApplications(): HasMany
    {
        return $this->hasMany(PklApplication::class);
    }

    public function scopeActive($query): void
    {
        $query->where('is_active', true);
    }
}
