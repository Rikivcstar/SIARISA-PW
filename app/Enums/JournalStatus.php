<?php

declare(strict_types=1);

namespace App\Enums;

enum JournalStatus: string
{
    case Pending = 'pending';
    case Validated = 'validated';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Validasi',
            self::Validated => 'Tervalidasi',
            self::Rejected => 'Ditolak',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'yellow',
            self::Validated => 'green',
            self::Rejected => 'red',
        };
    }
}
