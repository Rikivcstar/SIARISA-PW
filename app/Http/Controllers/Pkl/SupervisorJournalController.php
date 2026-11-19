<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pkl;

use App\Actions\Pkl\ValidateJournalAction;
use App\Enums\JournalStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pkl\ValidateJournalRequest;
use App\Models\AcademicYear;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SupervisorJournalController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Journal::class);

        /** @var User $user */
        $user = $request->user();
        $activeYear = AcademicYear::where('is_active', true)->first();

        $statusFilter = $request->input('status');
        $search = $request->input('search');
        $dateFilter = $request->input('date');

        $query = Journal::query()
            ->with([
                'pklApplication.student.user',
                'pklApplication.student.classroom',
                'pklApplication.student.major',
                'pklApplication.industry',
                'pklApplication.supervisor.teacher.user',
                'pklApplication.supervisor.industrySupervisor.user',
            ]);

        // Filter berdasarkan peran pengguna
        if ($user->hasRole('teacher') && $user->teacher) {
            $teacherId = $user->teacher->id;
            $query->whereHas('pklApplication.supervisor', function ($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            });
        } elseif ($user->hasRole('industry_supervisor') && $user->industrySupervisor) {
            $supervisorId = $user->industrySupervisor->id;
            $query->whereHas('pklApplication.supervisor', function ($q) use ($supervisorId) {
                $q->where('industry_supervisor_id', $supervisorId);
            });
        }

        // Filter tahun ajaran aktif
        if ($activeYear) {
            $query->whereHas('pklApplication', function ($q) use ($activeYear) {
                $q->where('academic_year_id', $activeYear->id);
            });
        }

        // Filter status
        if ($statusFilter && in_array($statusFilter, ['pending', 'validated', 'rejected'], true)) {
            $query->where('status', $statusFilter);
        }

        // Filter tanggal
        if ($dateFilter) {
            $query->where('date', $dateFilter);
        }

        // Pencarian nama siswa atau isi kegiatan
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('activity', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhereHas('pklApplication.student.user', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('pklApplication.student', function ($sq) use ($search) {
                        $sq->where('nis', 'like', "%{$search}%");
                    });
            });
        }

        // KPI Counts untuk tab pembimbing
        $kpiBaseQuery = Journal::query();
        if ($user->hasRole('teacher') && $user->teacher) {
            $teacherId = $user->teacher->id;
            $kpiBaseQuery->whereHas('pklApplication.supervisor', function ($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            });
        } elseif ($user->hasRole('industry_supervisor') && $user->industrySupervisor) {
            $supervisorId = $user->industrySupervisor->id;
            $kpiBaseQuery->whereHas('pklApplication.supervisor', function ($q) use ($supervisorId) {
                $q->where('industry_supervisor_id', $supervisorId);
            });
        }
        if ($activeYear) {
            $kpiBaseQuery->whereHas('pklApplication', function ($q) use ($activeYear) {
                $q->where('academic_year_id', $activeYear->id);
            });
        }

        $kpiCounts = (clone $kpiBaseQuery)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');
        $kpi = [
            'total' => (int) $kpiCounts->sum(),
            'pending' => (int) ($kpiCounts[JournalStatus::Pending->value] ?? 0),
            'validated' => (int) ($kpiCounts[JournalStatus::Validated->value] ?? 0),
            'rejected' => (int) ($kpiCounts[JournalStatus::Rejected->value] ?? 0),
        ];

        $journals = $query->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('pkl/supervisor/journals', [
            'activeYear' => $activeYear,
            'journals' => $journals,
            'kpi' => $kpi,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
                'date' => $dateFilter,
            ],
            'userRole' => $user->getRoleNames()->first() ?? 'teacher',
        ]);
    }

    public function validateJournal(ValidateJournalRequest $request, Journal $journal, ValidateJournalAction $action): RedirectResponse
    {
        $status = $request->validated('status');
        $rejectionReason = $request->validated('rejection_reason');

        $action->execute($journal, $status, $rejectionReason);

        if ($status === 'validated') {
            return back()->with('success', 'Jurnal kegiatan siswa berhasil disetujui dan divalidasi.');
        }

        return back()->with('success', 'Jurnal kegiatan siswa telah ditolak dengan catatan evaluasi.');
    }
}
