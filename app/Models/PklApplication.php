<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PklApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $student_id
 * @property int $industry_id
 * @property int $academic_year_id
 * @property PklApplicationStatus $status
 * @property Carbon|null $start_date
 * @property Carbon|null $end_date
 * @property string|null $rejection_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class PklApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'industry_id',
        'academic_year_id',
        'status',
        'start_date',
        'end_date',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'status'     => PklApplicationStatus::class,
            'start_date' => 'date',
            'end_date'   => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function industry(): BelongsTo
    {
        return $this->belongsTo(Industry::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function supervisor(): HasOne
    {
        return $this->hasOne(PklSupervisor::class);
    }

    public function journals(): HasMany
    {
        return $this->hasMany(Journal::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function grade(): HasOne
    {
        return $this->hasOne(PklGrade::class);
    }

    public function scopeApproved($query): void
    {
        $query->where('status', PklApplicationStatus::Approved);
    }
}

