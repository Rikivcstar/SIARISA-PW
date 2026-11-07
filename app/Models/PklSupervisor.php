<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $pkl_application_id
 * @property int|null $teacher_id
 * @property int|null $industry_supervisor_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class PklSupervisor extends Model
{
    protected $fillable = [
        'pkl_application_id',
        'teacher_id',
        'industry_supervisor_id',
    ];

    public function pklApplication(): BelongsTo
    {
        return $this->belongsTo(PklApplication::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function industrySupervisor(): BelongsTo
    {
        return $this->belongsTo(IndustrySupervisor::class);
    }
}

