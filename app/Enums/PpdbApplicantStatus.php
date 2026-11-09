<?php

declare(strict_types=1);

namespace App\Enums;

enum PpdbApplicantStatus: string
{
    case Registered = 'registered';
    case Verified = 'verified';
    case RevisionNeeded = 'revision_needed';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case ReRegistered = 're_registered';

    public function label(): string
    {
        return match ($this) {
            self::Registered => 'Terdaftar',
            self::Verified => 'Terverifikasi',
            self::RevisionNeeded => 'Perlu Revisi',
            self::Accepted => 'Diterima',
            self::Rejected => 'Ditolak',
            self::ReRegistered => 'Daftar Ulang',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Registered => 'blue',
            self::Verified => 'indigo',
            self::RevisionNeeded => 'orange',
            self::Accepted => 'green',
            self::Rejected => 'red',
            self::ReRegistered => 'teal',
        };
    }
}
