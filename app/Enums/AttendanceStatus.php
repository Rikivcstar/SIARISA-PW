<?php

declare(strict_types=1);

namespace App\Enums;

enum AttendanceStatus: string
{
    case Present = 'present';
    case Permission = 'permission';
    case Sick = 'sick';
    case Absent = 'absent';

    public function label(): string
    {
        return match ($this) {
            self::Present => 'Hadir',
            self::Permission => 'Izin',
            self::Sick => 'Sakit',
            self::Absent => 'Alpha',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Present => 'green',
            self::Permission => 'blue',
            self::Sick => 'yellow',
            self::Absent => 'red',
        };
    }
}
