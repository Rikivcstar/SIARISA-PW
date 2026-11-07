<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $nis
 * @property string|null $nisn
 * @property int|null $classroom_id
 * @property int $major_id
 * @property int|null $ppdb_applicant_id
 * @property string $status
 * @property string|null $phone
 * @property string|null $address
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nis',
        'nisn',
        'classroom_id',
        'major_id',
        'ppdb_applicant_id',
        'status',
        'phone',
        'address',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    public function major(): BelongsTo
    {
        return $this->belongsTo(Major::class);
    }

    public function pklApplications(): HasMany
    {
        return $this->hasMany(PklApplication::class);
    }

    public function activePklApplication(): HasOne
    {
        return $this->hasOne(PklApplication::class)->latestOfMany();
    }

    /**
     * Scope to filter by status.
     */
    public function scopeActive($query): void
    {
        $query->where('status', 'active');
    }
}

