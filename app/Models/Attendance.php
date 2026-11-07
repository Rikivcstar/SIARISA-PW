<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AttendanceStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $pkl_application_id
 * @property Carbon $date
 * @property AttendanceStatus $status
 * @property string|null $check_in
 * @property string|null $check_out
 * @property string|null $note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'pkl_application_id',
        'date',
        'status',
        'check_in',
        'check_out',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'date'   => 'date',
            'status' => AttendanceStatus::class,
        ];
    }

    public function pklApplication(): BelongsTo
    {
        return $this->belongsTo(PklApplication::class);
    }
}

