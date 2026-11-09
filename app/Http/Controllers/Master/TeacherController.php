<?php

declare(strict_types=1);

namespace App\Http\Controllers\Master;

use App\Actions\Master\CreateTeacherAction;
use App\Actions\Master\DeleteTeacherAction;
use App\Actions\Master\UpdateTeacherAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreTeacherRequest;
use App\Http\Requests\Master\UpdateTeacherRequest;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Teacher::class);

        $search = $request->string('search')->trim()->toString();

        $teachers = Teacher::query()
            ->with(['user'])
            ->withCount('supervisorAssignments')
            ->when($search !== '', function ($query) use ($search): void {
                $query->whereHas('user', function ($q) use ($search): void {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/teachers/index', [
            'teachers' => $teachers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(
        StoreTeacherRequest $request,
        CreateTeacherAction $action
    ): RedirectResponse {
        $action->execute($request->validated());

        return redirect()->route('master.teachers.index')
            ->with('success', 'Data guru pembimbing berhasil ditambahkan.');
    }

    public function update(
        UpdateTeacherRequest $request,
        Teacher $teacher,
        UpdateTeacherAction $action
    ): RedirectResponse {
        $action->execute($teacher, $request->validated());

        return redirect()->route('master.teachers.index')
            ->with('success', 'Data guru pembimbing berhasil diperbarui.');
    }

    public function destroy(
        Teacher $teacher,
        DeleteTeacherAction $action
    ): RedirectResponse {
        Gate::authorize('delete', $teacher);

        $action->execute($teacher);

        return redirect()->route('master.teachers.index')
            ->with('success', 'Data guru dan akun pengguna berhasil dihapus.');
    }
}
