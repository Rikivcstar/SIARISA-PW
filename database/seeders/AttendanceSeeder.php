<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\AttendanceStatus;
use App\Enums\PklApplicationStatus;
use App\Models\Attendance;
use App\Models\PklApplication;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $approvedApps = PklApplication::where('status', PklApplicationStatus::Approved)->get();

        if ($approvedApps->isEmpty()) {
            return;
        }

        $now = Carbon::now();

        foreach ($approvedApps as $app) {
            // Seed 10 hari ke belakang (kecuali Sabtu & Minggu)
            for ($i = 10; $i >= 1; $i--) {
                $date = $now->copy()->subDays($i);

                // Lewati akhir pekan
                if ($date->isWeekend()) {
                    continue;
                }

                $status = AttendanceStatus::Present;
                $note = null;

                if ($i === 4) {
                    $status = AttendanceStatus::Sick;
                    $note = 'Izin sakit flu dan demam, surat dokter dilampirkan.';
                } elseif ($i === 7) {
                    $status = AttendanceStatus::Permission;
                    $note = 'Izin keperluan keluarga mendadak.';
                }

                Attendance::firstOrCreate(
                    [
                        'pkl_application_id' => $app->id,
                        'date' => $date->toDateString(),
                    ],
                    [
                        'status' => $status,
                        'check_in' => $status === AttendanceStatus::Present ? '07:45:00' : null,
                        'check_out' => $status === AttendanceStatus::Present ? '16:30:00' : null,
                        'note' => $note,
                    ]
                );
            }

            // Presensi hari ini (Check-In sudah, Check-Out belum)
            if (! $now->isWeekend()) {
                Attendance::firstOrCreate(
                    [
                        'pkl_application_id' => $app->id,
                        'date' => $now->toDateString(),
                    ],
                    [
                        'status' => AttendanceStatus::Present,
                        'check_in' => '07:40:00',
                        'check_out' => null,
                        'note' => null,
                    ]
                );
            }
        }
    }
}
