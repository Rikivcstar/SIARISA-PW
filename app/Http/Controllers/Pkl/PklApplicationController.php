<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pkl;

use App\Actions\Pkl\ApprovePklApplicationAction;
use App\Actions\Pkl\AssignPklSupervisorsAction;
use App\Actions\Pkl\DeletePklApplicationAction;
use App\Actions\Pkl\RejectPklApplicationAction;
use App\Actions\Pkl\SubmitPklApplicationAction;
use App\Enums\PklApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pkl\AssignSupervisorsRequest;
use App\Http\Requests\Pkl\StorePklApplicationRequest;
use App\Http\Requests\Pkl\VerifyPklApplicationRequest;
use App\Models\AcademicYear;
use App\Models\Industry;
use App\Models\IndustrySupervisor;
use App\Models\Major;
use App\Models\PklApplication;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PklApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', PklApplication::class);

        /** @var User $user */
        $user = $request->user();
        $isStudent = $user->hasRole('student');
        $activeYear = AcademicYear::where('is_active', true)->first();

        // JIKA SISWA: Tampilkan Portal Khusus Siswa
        if ($isStudent) {
            $student = $user->student;

            $myApplication = null;
            if ($student && $activeYear) {
                $myApplication = PklApplication::where('student_id', $student->id)
                    ->where('academic_year_id', $activeYear->id)
                    ->with([
                        'industry',
                        'academicYear',
                        'supervisor.teacher.user',
                        'supervisor.industrySupervisor.user',
                    ])
                    ->first();
            }

            $availableIndustries = Industry::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'address', 'city', 'phone', 'email', 'contact_person', 'contact_phone']);

            return Inertia::render('pkl/applications/index', [
                'isStudent' => true,
                'student' => $student?->load(['major', 'classroom']),
                'myApplication' => $myApplication,
                'availableIndustries' => $availableIndustries,
                'activeYear' => $activeYear,
            ]);
        }

        // JIKA ADMIN / GURU / KEPSEK: Tampilkan Manajemen Penempatan PKL
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status')->trim()->toString();
        $majorId = $request->integer('major_id');
        $industryId = $request->integer('industry_id');

        $query = PklApplication::query()
            ->with([
                'student.user',
                'student.major',
                'student.classroom',
                'industry',
                'academicYear',
                'supervisor.teacher.user',
                'supervisor.industrySupervisor.user',
            ])
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($industryId > 0, fn ($q) => $q->where('industry_id', $industryId))
            ->when($majorId > 0, function ($q) use ($majorId): void {
                $q->whereHas('student', fn ($s) => $s->where('major_id', $majorId));
            })
            ->when($search !== '', function ($q) use ($search): void {
                $q->whereHas('student', function ($s) use ($search): void {
                    $s->where('nis', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
                })->orWhereHas('industry', fn ($ind) => $ind->where('name', 'like', "%{$search}%"));
            });

        // Hitung metrik KPI
        $kpiBase = PklApplication::query()
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id));

        $kpi = [
            'total' => (clone $kpiBase)->count(),
            'submitted' => (clone $kpiBase)->where('status', PklApplicationStatus::Submitted)->count(),
            'approved' => (clone $kpiBase)->where('status', PklApplicationStatus::Approved)->count(),
            'rejected' => (clone $kpiBase)->where('status', PklApplicationStatus::Rejected)->count(),
            'no_supervisor' => (clone $kpiBase)->where('status', PklApplicationStatus::Approved)
                ->whereDoesntHave('supervisor', fn ($s) => $s->whereNotNull('teacher_id'))->count(),
        ];

        $applications = $query->latest('id')->paginate(15)->withQueryString();

        $majors = Major::orderBy('code')->get(['id', 'name', 'code']);
        $industries = Industry::where('is_active', true)->orderBy('name')->get(['id', 'name', 'city']);
        $teachers = Teacher::with('user')->get();
        $industrySupervisors = IndustrySupervisor::with(['user', 'industry'])->get();

        return Inertia::render('pkl/applications/index', [
            'isStudent' => false,
            'applications' => $applications,
            'kpi' => $kpi,
            'majors' => $majors,
            'industries' => $industries,
            'teachers' => $teachers,
            'industrySupervisors' => $industrySupervisors,
            'activeYear' => $activeYear,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'major_id' => $majorId > 0 ? $majorId : '',
                'industry_id' => $industryId > 0 ? $industryId : '',
            ],
        ]);
    }

    public function store(
        StorePklApplicationRequest $request,
        SubmitPklApplicationAction $action
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasRole('student')) {
            $student = $user->student;
            if (! $student) {
                return redirect()->back()->with('error', 'Data profil siswa Anda tidak ditemukan.');
            }
            $studentId = $student->id;
        } else {
            $studentId = (int) $request->input('student_id');
        }

        $action->execute($studentId, $request->validated());

        return redirect()->route('pkl.applications.index')
            ->with('success', 'Pengajuan tempat PKL berhasil dikirim dan menunggu verifikasi.');
    }

    public function verify(
        VerifyPklApplicationRequest $request,
        PklApplication $application,
        ApprovePklApplicationAction $approveAction,
        RejectPklApplicationAction $rejectAction
    ): RedirectResponse {
        $status = $request->string('status')->toString();

        if ($status === 'approved') {
            $approveAction->execute($application, $request->validated());
            $message = "Pengajuan PKL {$application->student->user->name} berhasil disetujui.";
        } else {
            $reason = $request->string('rejection_reason')->toString();
            $rejectAction->execute($application, $reason);
            $message = "Pengajuan PKL {$application->student->user->name} telah ditolak.";
        }

        return redirect()->route('pkl.applications.index')
            ->with('success', $message);
    }

    public function assignSupervisors(
        AssignSupervisorsRequest $request,
        PklApplication $application,
        AssignPklSupervisorsAction $action
    ): RedirectResponse {
        $action->execute($application, $request->validated());

        return redirect()->route('pkl.applications.index')
            ->with('success', "Pembimbing PKL untuk {$application->student->user->name} berhasil ditetapkan.");
    }

    public function destroy(
        PklApplication $application,
        DeletePklApplicationAction $action
    ): RedirectResponse {
        Gate::authorize('delete', $application);

        $studentName = $application->student->user->name ?? 'Siswa';
        $action->execute($application);

        return redirect()->route('pkl.applications.index')
            ->with('success', "Berkas pengajuan PKL {$studentName} berhasil dibatalkan.");
    }
}
