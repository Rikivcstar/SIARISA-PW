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
                'attendances',
                'journals',
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
        $allApproved = (clone $query)->get();
        $totalPlaced = $allApproved->count();

        $totalAttendances = 0;
        $totalPresent = 0;
        $totalJournals = 0;
        $totalPendingJournals = 0;

        foreach ($allApproved as $app) {
            $atts = $app->attendances;
            $totalAttendances += $atts->count();
            $totalPresent += $atts->where('status', AttendanceStatus::Present)->count();

            $jns = $app->journals;
            $totalJournals += $jns->count();
            $totalPendingJournals += $jns->where('status', JournalStatus::Pending)->count();
        }

        $overallAttendanceRate = $totalAttendances > 0
            ? round(($totalPresent / $totalAttendances) * 100, 1)
            : 0;

        $kpi = [
            'total_students' => $totalPlaced,
            'attendance_rate' => $overallAttendanceRate,
            'total_journals' => $totalJournals,
            'pending_journals' => $totalPendingJournals,
        ];

        // Paginated results with calculated per-student metrics
        $applications = $query->paginate(12)->withQueryString();

        $applications->getCollection()->transform(function (PklApplication $app) {
            $atts = $app->attendances;
            $totalAtt = $atts->count();
            $presentCount = $atts->where('status', AttendanceStatus::Present)->count();
            $rate = $totalAtt > 0 ? round(($presentCount / $totalAtt) * 100, 1) : 0;

            $jns = $app->journals;

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
                    'permission' => $atts->where('status', AttendanceStatus::Permission)->count(),
                    'sick' => $atts->where('status', AttendanceStatus::Sick)->count(),
                    'absent' => $atts->where('status', AttendanceStatus::Absent)->count(),
                    'rate' => $rate,
                ],
                'journal_summary' => [
                    'total' => $jns->count(),
                    'validated' => $jns->where('status', JournalStatus::Validated)->count(),
                    'pending' => $jns->where('status', JournalStatus::Pending)->count(),
                    'rejected' => $jns->where('status', JournalStatus::Rejected)->count(),
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
