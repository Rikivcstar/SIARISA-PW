<?php

declare(strict_types=1);

namespace Tests\Feature\Pkl;

use App\Enums\AttendanceStatus;
use App\Enums\JournalStatus;
use App\Enums\PklApplicationStatus;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Industry;
use App\Models\Journal;
use App\Models\Major;
use App\Models\PklApplication;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\MajorSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(MajorSeeder::class);

    $this->academicYear = AcademicYear::create([
        'name' => '2026/2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
        'is_active' => true,
    ]);

    $this->major = Major::first();

    $this->industry = Industry::create([
        'name' => 'PT Telekomunikasi Seluler',
        'address' => 'Jl. Pajajaran No. 99',
        'city' => 'Bogor',
        'is_active' => true,
    ]);
});

test('unauthenticated user cannot access pkl monitoring', function (): void {
    $response = $this->get('/pkl/monitoring');
    $response->assertRedirect('/login');
});

test('admin can view pkl monitoring page with statistics', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $studentUser = User::factory()->create();
    $studentUser->assignRole('student');

    $student = Student::create([
        'user_id' => $studentUser->id,
        'nis' => '99003',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
        'start_date' => '2026-08-01',
        'end_date' => '2026-11-30',
    ]);

    Attendance::create([
        'pkl_application_id' => $pklApp->id,
        'date' => Carbon::now()->toDateString(),
        'status' => AttendanceStatus::Present,
        'check_in' => '07:45:00',
    ]);

    Journal::create([
        'pkl_application_id' => $pklApp->id,
        'date' => Carbon::now()->toDateString(),
        'activity' => 'Melakukan pemeliharaan server lokal dan dokumentasi jaringan.',
        'status' => JournalStatus::Validated,
        'validated_at' => Carbon::now(),
    ]);

    $response = $this->actingAs($admin)->get('/pkl/monitoring');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pkl/monitoring/index')
        ->has('kpi')
        ->has('applications.data', 1)
    );
});

test('admin can filter monitoring by industry', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $studentUser = User::factory()->create();
    $studentUser->assignRole('student');

    $student = Student::create([
        'user_id' => $studentUser->id,
        'nis' => '99003',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
        'start_date' => '2026-08-01',
        'end_date' => '2026-11-30',
    ]);

    $response = $this->actingAs($admin)->get("/pkl/monitoring?industry_id={$this->industry->id}");
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('pkl/monitoring/index')
        ->has('applications.data', 1)
    );
});
