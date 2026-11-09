<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Actions\Master\CreateAcademicYearAction;
use App\Actions\Master\CreateClassroomAction;
use App\Actions\Master\DeleteClassroomAction;
use App\Actions\Master\ToggleActiveAcademicYearAction;
use App\Actions\Master\UpdateClassroomAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreAcademicYearRequest;
use App\Http\Requests\Master\StoreClassroomRequest;
use App\Http\Requests\Master\UpdateClassroomRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Major;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', AcademicYear::class);

        $selectedYearId = $request->integer('academic_year_id');

        $activeYear = AcademicYear::where('is_active', true)->first();

        if ($selectedYearId === 0 && $activeYear) {
            $selectedYearId = $activeYear->id;
        }

        $academicYears = AcademicYear::withCount('classrooms')
            ->latest('start_date')
            ->get();

        $classrooms = Classroom::query()
            ->when($selectedYearId > 0, fn ($q) => $q->where('academic_year_id', $selectedYearId))
            ->with(['major', 'academicYear'])
            ->withCount('students')
            ->orderBy('name')
            ->get();

        $majors = Major::orderBy('code')->get(['id', 'name', 'code']);

        return Inertia::render('master/academic-years/index', [
            'academicYears' => $academicYears,
            'classrooms' => $classrooms,
            'majors' => $majors,
            'selectedYearId' => $selectedYearId,
        ]);
    }

    public function store(
        StoreAcademicYearRequest $request,
        CreateAcademicYearAction $action
    ): RedirectResponse {
        $action->execute($request->validated());

        return redirect()->route('master.academic-years.index')
            ->with('success', 'Tahun ajaran baru berhasil ditambahkan.');
    }

    public function toggleActive(
        AcademicYear $academicYear,
        ToggleActiveAcademicYearAction $action
    ): RedirectResponse {
        Gate::authorize('update', $academicYear);

        $action->execute($academicYear);

        return redirect()->route('master.academic-years.index', ['academic_year_id' => $academicYear->id])
            ->with('success', "Tahun ajaran {$academicYear->name} sekarang berstatus aktif.");
    }

    public function storeClassroom(
        StoreClassroomRequest $request,
        CreateClassroomAction $action
    ): RedirectResponse {
        $classroom = $action->execute($request->validated());

        return redirect()->route('master.academic-years.index', ['academic_year_id' => $classroom->academic_year_id])
            ->with('success', "Kelas {$classroom->name} berhasil ditambahkan.");
    }

    public function updateClassroom(
        UpdateClassroomRequest $request,
        Classroom $classroom,
        UpdateClassroomAction $action
    ): RedirectResponse {
        $action->execute($classroom, $request->validated());

        return redirect()->route('master.academic-years.index', ['academic_year_id' => $classroom->academic_year_id])
            ->with('success', "Data kelas {$classroom->name} berhasil diperbarui.");
    }

    public function destroyClassroom(
        Classroom $classroom,
        DeleteClassroomAction $action
    ): RedirectResponse {
        Gate::authorize('delete', $classroom);

        $yearId = $classroom->academic_year_id;
        $name = $classroom->name;

        $action->execute($classroom);

        return redirect()->route('master.academic-years.index', ['academic_year_id' => $yearId])
            ->with('success', "Kelas {$name} berhasil dihapus.");
    }
}
