import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format ISO or YYYY-MM-DD date string to Indonesian format (e.g. 1 Agustus 2026)
 */
export function formatDateIndo(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    // If it's ISO like 2026-08-01T00:00:00.000000Z or 2026-08-01
    const cleanDate = dateStr.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];
    if (monthIndex < 0 || monthIndex > 11 || isNaN(day)) return dateStr;
    return `${day} ${months[monthIndex]} ${year}`;
}

