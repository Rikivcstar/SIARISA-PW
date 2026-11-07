<?php

declare(strict_types=1);

namespace App\Enums;

enum PklApplicationStatus: string
{
    case Submitted = 'submitted';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::Submitted => 'Diajukan',
            self::Approved  => 'Disetujui',
            self::Rejected  => 'Ditolak',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Submitted => 'yellow',
            self::Approved  => 'green',
            self::Rejected  => 'red',
        };
    }
}

