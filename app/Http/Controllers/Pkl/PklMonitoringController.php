<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pkl;

use App\Enums\AttendanceStatus;
use App\Enums\JournalStatus;
use App\Enums\PklApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Industry;
use App\Models\Major;
use App\Models\PklApplication;
use App\Models\Attendance;
use App\Models\Journal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PklMonitoringController extends Controller
{
    public function index(Request $request): Response
    {
        $activeYear = AcademicYear::where('is_active', true)->first();

        $search = $request->input('search');
        $majorId = $request->input('major_id');
        $classroomId = $request->input('classroom_id');
        $industryId = $request->input('industry_id');

        $query = PklApplication::query()
            ->where('status', PklApplicationStatus::Approved)
            ->with([
                'student.user',
                'student.classroom',
                'student.major',
                'industry',
                'supervisor.teacher.user',
                'supervisor.industrySupervisor.user',
            ])
            ->withCount([
                'attendances',
                'attendances as present_attendances_count' => fn ($q) => $q->where('status', AttendanceStatus::Present),
                'attendances as permission_attendances_count' => fn ($q) => $q->where('status', AttendanceStatus::Permission),
                'attendances as sick_attendances_count' => fn ($q) => $q->where('status', AttendanceStatus::Sick),
                'attendances as absent_attendances_count' => fn ($q) => $q->where('status', AttendanceStatus::Absent),
                'journals',
                'journals as validated_journals_count' => fn ($q) => $q->where('status', JournalStatus::Validated),
                'journals as pending_journals_count' => fn ($q) => $q->where('status', JournalStatus::Pending),
                'journals as rejected_journals_count' => fn ($q) => $q->where('status', JournalStatus::Rejected),
            ]);

        if ($activeYear) {
            $query->where('academic_year_id', $activeYear->id);
        }

        if ($majorId) {
            $query->whereHas('student', function ($q) use ($majorId) {
                $q->where('major_id', $majorId);
            });
        }

        if ($classroomId) {
            $query->whereHas('student', function ($q) use ($classroomId) {
                $q->where('classroom_id', $classroomId);
            });
        }

        if ($industryId) {
            $query->where('industry_id', $industryId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('student.user', function ($sq) use ($search) {
                    $sq->where('name', 'like', "%{$search}%");
                })->orWhereHas('student', function ($sq) use ($search) {
                    $sq->where('nis', 'like', "%{$search}%");
                })->orWhereHas('industry', function ($iq) use ($search) {
                    $iq->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Global KPI Stats
        $applicationIds = (clone $query)->reorder()->select('pkl_applications.id');
        $totalPlaced = (clone $query)->count();
        $attendanceStats = Attendance::query()->whereIn('pkl_application_id', $applicationIds)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as present', [AttendanceStatus::Present->value])->first();
        $totalAttendances = (int) $attendanceStats->total;
        $totalPresent = (int) $attendanceStats->present;
        $journalStats = Journal::query()->whereIn('pkl_application_id', $applicationIds)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending', [JournalStatus::Pending->value])->first();

        $overallAttendanceRate = $totalAttendances > 0
            ? round(($totalPresent / $totalAttendances) * 100, 1)
            : 0;

        $kpi = [
            'total_students' => $totalPlaced,
            'attendance_rate' => $overallAttendanceRate,
            'total_journals' => (int) $journalStats->total,
            'pending_journals' => (int) $journalStats->pending,
        ];

        // Paginated results with calculated per-student metrics
        $applications = $query->paginate(12)->withQueryString();

        $applications->getCollection()->transform(function (PklApplication $app) {
            $totalAtt = $app->attendances_count;
            $presentCount = $app->present_attendances_count;
            $rate = $totalAtt > 0 ? round(($presentCount / $totalAtt) * 100, 1) : 0;

            return [
                'id' => $app->id,
                'student' => [
                    'id' => $app->student->id,
                    'nis' => $app->student->nis,
                    'name' => $app->student->user->name,
                    'email' => $app->student->user->email,
                    'classroom' => $app->student->classroom?->name ?? '-',
                    'major_code' => $app->student->major?->code ?? '-',
                    'major_name' => $app->student->major?->name ?? '-',
                ],
                'industry' => [
                    'id' => $app->industry->id,
                    'name' => $app->industry->name,
                    'city' => $app->industry->city,
                ],
                'period' => [
                    'start_date' => $app->start_date?->toDateString(),
                    'end_date' => $app->end_date?->toDateString(),
                ],
                'supervisors' => [
                    'teacher_name' => $app->supervisor?->teacher?->user?->name ?? 'Belum Ditugaskan',
                    'industry_name' => $app->supervisor?->industrySupervisor?->user?->name ?? 'Belum Ditugaskan',
                ],
                'attendance_summary' => [
                    'total' => $totalAtt,
                    'present' => $presentCount,
                    'permission' => $app->permission_attendances_count,
                    'sick' => $app->sick_attendances_count,
                    'absent' => $app->absent_attendances_count,
                    'rate' => $rate,
                ],
                'journal_summary' => [
                    'total' => $app->journals_count,
                    'validated' => $app->validated_journals_count,
                    'pending' => $app->pending_journals_count,
                    'rejected' => $app->rejected_journals_count,
                ],
            ];
        });

        return Inertia::render('pkl/monitoring/index', [
            'activeYear' => $activeYear,
            'applications' => $applications,
            'kpi' => $kpi,
            'filters' => [
                'search' => $search,
                'major_id' => $majorId,
                'classroom_id' => $classroomId,
                'industry_id' => $industryId,
            ],
            'majors' => Major::orderBy('name')->get(['id', 'name', 'code']),
            'classrooms' => Classroom::orderBy('name')->get(['id', 'name']),
            'industries' => Industry::orderBy('name')->get(['id', 'name']),
        ]);
    }
}
