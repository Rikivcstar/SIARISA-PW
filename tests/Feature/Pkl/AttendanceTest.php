<?php

declare(strict_types=1);

namespace Tests\Feature\Pkl;

use App\Enums\AttendanceStatus;
use App\Enums\PklApplicationStatus;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Industry;
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
        'name' => 'PT Solusi Teknologi Nusantara',
        'address' => 'Jl. Pajajaran No. 88',
        'city' => 'Bogor',
        'is_active' => true,
    ]);
});

test('unauthenticated user cannot access pkl attendance', function (): void {
    $response = $this->get('/pkl/attendance');
    $response->assertRedirect('/login');
});

test('student can view attendance page', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99001',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get('/pkl/attendance');
    $response->assertOk();
});

test('student with approved placement can record check-in attendance', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99001',
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

    $today = Carbon::now()->toDateString();

    $response = $this->actingAs($user)->post('/pkl/attendance', [
        'date' => $today,
        'status' => 'present',
        'check_in' => '07:45',
        'note' => 'Tepat waktu',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendances', [
        'pkl_application_id' => $pklApp->id,
        'status' => AttendanceStatus::Present->value,
        'check_in' => '07:45',
    ]);
});

test('student cannot record attendance without approved pkl placement', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99001',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $today = Carbon::now()->toDateString();

    $response = $this->actingAs($user)->post('/pkl/attendance', [
        'date' => $today,
        'status' => 'present',
        'check_in' => '07:45',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
    $this->assertDatabaseCount('attendances', 0);
});

test('student can update attendance check-out', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99001',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    $today = Carbon::now()->toDateString();

    $attendance = Attendance::create([
        'pkl_application_id' => $pklApp->id,
        'date' => $today,
        'status' => AttendanceStatus::Present,
        'check_in' => '07:40:00',
    ]);

    $response = $this->actingAs($user)->put("/pkl/attendance/{$attendance->id}", [
        'check_out' => '16:45',
        'note' => 'Selesai tugas tepat waktu',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendances', [
        'id' => $attendance->id,
        'check_out' => '16:45',
        'note' => 'Selesai tugas tepat waktu',
    ]);
});

test('student can record permission or sick with notes', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99001',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    $today = Carbon::now()->toDateString();

    $response = $this->actingAs($user)->post('/pkl/attendance', [
        'date' => $today,
        'status' => 'sick',
        'note' => 'Izin tidak masuk karena sakit demam tinggi.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendances', [
        'pkl_application_id' => $pklApp->id,
        'status' => AttendanceStatus::Sick->value,
        'note' => 'Izin tidak masuk karena sakit demam tinggi.',
    ]);
});
