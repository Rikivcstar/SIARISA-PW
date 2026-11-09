<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Actions\Master\CreateStudentAction;
use App\Actions\Master\DeleteStudentAction;
use App\Actions\Master\UpdateStudentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreStudentRequest;
use App\Http\Requests\Master\UpdateStudentRequest;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Major;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Student::class);

        $search = $request->string('search')->trim()->toString();
        $majorId = $request->integer('major_id');
        $classroomId = $request->integer('classroom_id');
        $status = $request->string('status')->trim()->toString();

        $students = Student::query()
            ->with(['user', 'major', 'classroom.academicYear'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('nis', 'like', "%{$search}%")
                        ->orWhere('nisn', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($sub) use ($search): void {
                            $sub->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($majorId > 0, fn ($query) => $query->where('major_id', $majorId))
            ->when($classroomId > 0, fn ($query) => $query->where('classroom_id', $classroomId))
            ->when($status !== '' && in_array($status, ['active', 'inactive', 'graduated'], true), fn ($query) => $query->where('status', $status))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $majors = Major::orderBy('code')->get(['id', 'name', 'code']);

        $activeYear = AcademicYear::where('is_active', true)->first();
        $classrooms = Classroom::query()
            ->when($activeYear, fn ($q) => $q->where('academic_year_id', $activeYear->id))
            ->orderBy('name')
            ->get(['id', 'name', 'major_id', 'academic_year_id']);

        return Inertia::render('master/students/index', [
            'students' => $students,
            'majors' => $majors,
            'classrooms' => $classrooms,
            'filters' => [
                'search' => $search,
                'major_id' => $majorId > 0 ? $majorId : '',
                'classroom_id' => $classroomId > 0 ? $classroomId : '',
                'status' => $status,
            ],
        ]);
    }

    public function store(
        StoreStudentRequest $request,
        CreateStudentAction $action
    ): RedirectResponse {
        $action->execute($request->validated());

        return redirect()->route('master.students.index')
            ->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(
        UpdateStudentRequest $request,
        Student $student,
        UpdateStudentAction $action
    ): RedirectResponse {
        $action->execute($student, $request->validated());

        return redirect()->route('master.students.index')
            ->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(
        Student $student,
        DeleteStudentAction $action
    ): RedirectResponse {
        Gate::authorize('delete', $student);

        $action->execute($student);

        return redirect()->route('master.students.index')
            ->with('success', 'Data siswa dan akun login berhasil dihapus.');
    }
}
