<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\JournalStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $pkl_application_id
 * @property Carbon $date
 * @property string $activity
 * @property string|null $location
 * @property JournalStatus $status
 * @property Carbon|null $validated_at
 * @property string|null $rejection_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Journal extends Model
{
    use HasFactory;

    protected $fillable = [
        'pkl_application_id',
        'date',
        'activity',
        'location',
        'status',
        'validated_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'date'         => 'date',
            'status'       => JournalStatus::class,
            'validated_at' => 'datetime',
        ];
    }

    public function pklApplication(): BelongsTo
    {
        return $this->belongsTo(PklApplication::class);
    }

    public function scopePending($query): void
    {
        $query->where('status', JournalStatus::Pending);
    }
}

