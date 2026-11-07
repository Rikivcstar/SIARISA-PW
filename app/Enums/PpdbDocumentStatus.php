<?php

declare(strict_types=1);

namespace App\Enums;

enum PpdbDocumentStatus: string
{
    case Pending  = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::Pending  => 'Menunggu Verifikasi',
            self::Accepted => 'Diterima',
            self::Rejected => 'Ditolak',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Pending  => 'yellow',
            self::Accepted => 'green',
            self::Rejected => 'red',
        };
    }
}

