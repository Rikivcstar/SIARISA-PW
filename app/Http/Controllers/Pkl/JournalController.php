<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pkl;

use App\Actions\Pkl\DeleteJournalAction;
use App\Actions\Pkl\SubmitJournalAction;
use App\Actions\Pkl\UpdateJournalAction;
use App\Enums\JournalStatus;
use App\Enums\PklApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pkl\StoreJournalRequest;
use App\Http\Requests\Pkl\UpdateJournalRequest;
use App\Models\AcademicYear;
use App\Models\Journal;
use App\Models\PklApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        Gate::authorize('viewAny', Journal::class);

        /** @var User $user */
        $user = $request->user();

        // Jika Guru atau Pembimbing Industri, alihkan ke halaman validasi jurnal
        if ($user->hasRole(['teacher', 'industry_supervisor'])) {
            return redirect()->route('pkl.supervisor.journals.index');
        }

        // Jika bukan siswa (misal admin), alihkan ke monitoring
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

        $journals = null;
        $stats = [
            'total' => 0,
            'validated' => 0,
            'pending' => 0,
            'rejected' => 0,
        ];

        if ($application) {
            $journals = Journal::where('pkl_application_id', $application->id)
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString();

            $journalCounts = Journal::query()
                ->where('pkl_application_id', $application->id)
                ->selectRaw('status, COUNT(*) as aggregate')
                ->groupBy('status')
                ->pluck('aggregate', 'status');
            $stats = [
                'total' => (int) $journalCounts->sum(),
                'validated' => (int) ($journalCounts[JournalStatus::Validated->value] ?? 0),
                'pending' => (int) ($journalCounts[JournalStatus::Pending->value] ?? 0),
                'rejected' => (int) ($journalCounts[JournalStatus::Rejected->value] ?? 0),
            ];
        }

        return Inertia::render('pkl/journal/index', [
            'activeYear' => $activeYear,
            'application' => $application,
            'journals' => $journals,
            'stats' => $stats,
            'todayDate' => Carbon::now()->toDateString(),
        ]);
    }

    public function store(StoreJournalRequest $request, SubmitJournalAction $action): RedirectResponse
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
            return back()->with('error', 'Anda belum memiliki tempat PKL yang disetujui untuk mengisi jurnal.');
        }

        $action->execute($application->id, $request->validated());

        return back()->with('success', 'Catatan jurnal kegiatan harian berhasil dikirim untuk divalidasi pembimbing.');
    }

    public function update(UpdateJournalRequest $request, Journal $journal, UpdateJournalAction $action): RedirectResponse
    {
        $action->execute($journal, $request->validated());

        return back()->with('success', 'Jurnal kegiatan berhasil diperbarui dan dikirim kembali.');
    }

    public function destroy(Journal $journal, DeleteJournalAction $action): RedirectResponse
    {
        Gate::authorize('delete', $journal);

        $action->execute($journal);

        return back()->with('success', 'Jurnal kegiatan berhasil dihapus.');
    }
}
