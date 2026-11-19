<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pkl;

use App\Actions\Pkl\RecordAttendanceAction;
use App\Enums\AttendanceStatus;
use App\Enums\PklApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pkl\StoreAttendanceRequest;
use App\Http\Requests\Pkl\UpdateAttendanceRequest;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\PklApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        Gate::authorize('viewAny', Attendance::class);

        /** @var User $user */
        $user = $request->user();

        // Jika bukan siswa (misal Guru/Admin), alihkan ke monitoring
        if (! $user->hasRole('student')) {
            return redirect()->route('pkl.monitoring.index');
        }

        $student = $user->student;
        $activeYear = AcademicYear::where('is_active', true)->first();

        $application = null;
        if ($student && $activeYear) {
            $application = PklApplication::where('student_id', $student->id)
                ->where('academic_year_id', $activeYear->id)
                ->where('status', PklApplicationStatus::Approved)
                ->with(['industry', 'supervisor.teacher.user', 'supervisor.industrySupervisor.user'])
                ->first();
        }

        $today = Carbon::now()->toDateString();
        $todayAttendance = null;
        $attendances = null;
        $stats = [
            'total' => 0,
            'present' => 0,
            'permission' => 0,
            'sick' => 0,
            'absent' => 0,
            'attendance_rate' => 0,
        ];

        if ($application) {
            $todayAttendance = Attendance::where('pkl_application_id', $application->id)
                ->where('date', $today)
                ->first();

            $attendances = Attendance::where('pkl_application_id', $application->id)
                ->orderByDesc('date')
                ->paginate(15)
                ->withQueryString();

            // Statistik kehadiran akumulatif
            $attendanceCounts = Attendance::query()
                ->where('pkl_application_id', $application->id)
                ->selectRaw('status, COUNT(*) as aggregate')
                ->groupBy('status')
                ->pluck('aggregate', 'status');
            $totalCount = (int) $attendanceCounts->sum();
            $presentCount = (int) ($attendanceCounts[AttendanceStatus::Present->value] ?? 0);
            $permissionCount = (int) ($attendanceCounts[AttendanceStatus::Permission->value] ?? 0);
            $sickCount = (int) ($attendanceCounts[AttendanceStatus::Sick->value] ?? 0);
            $absentCount = (int) ($attendanceCounts[AttendanceStatus::Absent->value] ?? 0);

            $stats = [
                'total' => $totalCount,
                'present' => $presentCount,
                'permission' => $permissionCount,
                'sick' => $sickCount,
                'absent' => $absentCount,
                'attendance_rate' => $totalCount > 0 ? round(($presentCount / $totalCount) * 100, 1) : 0,
            ];
        }

        return Inertia::render('pkl/attendance/index', [
            'activeYear' => $activeYear,
            'application' => $application,
            'todayAttendance' => $todayAttendance,
            'todayDate' => $today,
            'attendances' => $attendances,
            'stats' => $stats,
        ]);
    }

    public function store(StoreAttendanceRequest $request, RecordAttendanceAction $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $student = $user->student;
        $activeYear = AcademicYear::where('is_active', true)->first();

        if (! $student || ! $activeYear) {
            return back()->with('error', 'Data siswa atau tahun ajaran aktif tidak ditemukan.');
        }

        $application = PklApplication::where('student_id', $student->id)
            ->where('academic_year_id', $activeYear->id)
            ->where('status', PklApplicationStatus::Approved)
            ->first();

        if (! $application) {
            return back()->with('error', 'Anda belum memiliki tempat PKL yang disetujui untuk mengisi absensi.');
        }

        $action->execute($application->id, $request->validated());

        return back()->with('success', 'Presensi hari ini berhasil dicatat.');
    }

    public function update(UpdateAttendanceRequest $request, Attendance $attendance, RecordAttendanceAction $action): RedirectResponse
    {
        $action->execute($attendance->pkl_application_id, array_merge($request->validated(), [
            'date' => $attendance->date->toDateString(),
        ]));

        return back()->with('success', 'Data presensi berhasil diperbarui.');
    }
}
