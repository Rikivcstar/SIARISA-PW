<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\JournalStatus;
use App\Enums\PklApplicationStatus;
use App\Models\AcademicYear;
use App\Models\Industry;
use App\Models\Journal;
use App\Models\PklApplication;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        $stats = [];
        $recentApplications = [];
        $recentJournals = [];
        $myApplication = null;

        if ($user->hasRole('admin') || $user->hasRole('headmaster')) {
            $stats = [
                'total_students' => Student::count(),
                'total_industries' => Industry::where('is_active', true)->count(),
                'total_teachers' => Teacher::count(),
                'active_pkl' => PklApplication::where('status', PklApplicationStatus::Approved)->count(),
                'pending_pkl' => PklApplication::where('status', PklApplicationStatus::Submitted)->count(),
                'pending_journals' => Journal::where('status', JournalStatus::Pending)->count(),
            ];

            $recentApplications = PklApplication::with(['student.user', 'student.major', 'industry'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($app) => [
                    'id' => $app->id,
                    'student_name' => $app->student?->user?->name ?? '-',
                    'student_nis' => $app->student?->nis ?? '-',
                    'major_code' => $app->student?->major?->code ?? '-',
                    'industry_name' => $app->industry?->name ?? '-',
                    'status' => $app->status->value,
                    'status_label' => $app->status->label(),
                    'status_color' => $app->status->color(),
                    'created_at' => $app->created_at?->diffForHumans() ?? '-',
                ]);
        } elseif ($user->hasRole('student')) {
            $student = $user->student;
            if ($student) {
                $myApplication = PklApplication::with(['industry', 'supervisor.teacher.user', 'supervisor.industrySupervisor.user', 'grade'])
                    ->where('student_id', $student->id)
                    ->latest()
                    ->first();
            }
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentApplications' => $recentApplications,
            'activeYear' => $activeYear ? [
                'id' => $activeYear->id,
                'name' => $activeYear->name,
            ] : null,
        ]);
    }
}
