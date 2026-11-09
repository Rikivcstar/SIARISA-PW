<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\JournalStatus;
use App\Enums\PklApplicationStatus;
use App\Models\Industry;
use App\Models\Journal;
use App\Models\PklApplication;
use App\Models\Setting;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'school' => [
                'name' => Setting::getValue('school_name', 'SMK Islam Terpadu Ar-Risalah Cariu'),
                'short_name' => Setting::getValue('school_short_name', 'SMK IT Ar-Risalah'),
                'system_name' => Setting::getValue('system_name', 'SIARISA'),
            ],
            'counts' => [
                'industries' => Industry::where('is_active', true)->count(),
                'students' => Student::count(),
                'teachers' => Teacher::count(),
                'pending_pkl' => PklApplication::where('status', PklApplicationStatus::Submitted)->count(),
                'pending_journals' => Journal::where('status', JournalStatus::Pending)->count(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
