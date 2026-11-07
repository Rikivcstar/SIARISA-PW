<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $pkl_application_id
 * @property float|null $industry_grade
 * @property float|null $teacher_grade
 * @property float|null $final_grade
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class PklGrade extends Model
{
    protected $fillable = [
        'pkl_application_id',
        'industry_grade',
        'teacher_grade',
        'final_grade',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'industry_grade' => 'decimal:2',
            'teacher_grade'  => 'decimal:2',
            'final_grade'    => 'decimal:2',
        ];
    }

    public function pklApplication(): BelongsTo
    {
        return $this->belongsTo(PklApplication::class);
    }

    /**
     * Calculate the final grade using the PKL weight settings.
     * Default: 60% industry + 40% teacher.
     */
    public function calculateFinalGrade(float $industryWeight = 0.6, float $teacherWeight = 0.4): ?float
    {
        if ($this->industry_grade === null || $this->teacher_grade === null) {
            return null;
        }

        return round(
            ((float) $this->industry_grade * $industryWeight) + ((float) $this->teacher_grade * $teacherWeight),
            2,
        );
    }
}

