<?php

declare(strict_types=1);

use App\Enums\PklApplicationStatus;
use App\Models\AcademicYear;
use App\Models\Industry;
use App\Models\IndustrySupervisor;
use App\Models\Major;
use App\Models\PklApplication;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\MajorSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

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
        'name' => 'PT Telekomunikasi Indonesia',
        'address' => 'Jl. Pajajaran No. 10',
        'city' => 'Bogor',
        'is_active' => true,
    ]);
});

test('unauthenticated user cannot access pkl applications', function (): void {
    $response = $this->get('/pkl/applications');
    $response->assertRedirect('/login');
});

test('student can view their pkl application portal', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '12345',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get('/pkl/applications');
    $response->assertOk();
});

test('student can submit pkl application', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '12345',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->post('/pkl/applications', [
        'industry_id' => $this->industry->id,
        'start_date' => '2026-08-01',
        'end_date' => '2026-11-30',
    ]);

    $response->assertRedirect('/pkl/applications');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('pkl_applications', [
        'student_id' => $student->id,
        'industry_id' => $this->industry->id,
        'academic_year_id' => $this->academicYear->id,
        'status' => PklApplicationStatus::Submitted->value,
    ]);
});

test('student cannot submit duplicate application in same academic year', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '12345',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    PklApplication::create([
        'student_id' => $student->id,
        'industry_id' => $this->industry->id,
        'academic_year_id' => $this->academicYear->id,
        'status' => PklApplicationStatus::Submitted,
    ]);

    $response = $this->actingAs($user)->post('/pkl/applications', [
        'industry_id' => $this->industry->id,
        'start_date' => '2026-08-01',
        'end_date' => '2026-11-30',
    ]);

    $response->assertSessionHasErrors('industry_id');
});

test('student can cancel their submitted pkl application', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '12345',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $app = PklApplication::create([
        'student_id' => $student->id,
        'industry_id' => $this->industry->id,
        'academic_year_id' => $this->academicYear->id,
        'status' => PklApplicationStatus::Submitted,
    ]);

    $response = $this->actingAs($user)->delete("/pkl/applications/{$app->id}");

    $response->assertRedirect('/pkl/applications');
    $this->assertDatabaseMissing('pkl_applications', ['id' => $app->id]);
});

test('admin can view all applications list and kpis', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/pkl/applications');
    $response->assertOk();
});

test('admin can approve a student application', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $studentUser = User::factory()->create();
    $student = Student::create([
        'user_id' => $studentUser->id,
        'nis' => '12345',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $app = PklApplication::create([
        'student_id' => $student->id,
        'industry_id' => $this->industry->id,
        'academic_year_id' => $this->academicYear->id,
        'status' => PklApplicationStatus::Submitted,
    ]);

    $response = $this->actingAs($admin)->put("/pkl/applications/{$app->id}/verify", [
        'status' => 'approved',
        'start_date' => '2026-08-01',
        'end_date' => '2026-11-30',
    ]);

    $response->assertRedirect('/pkl/applications');
    $response->assertSessionHas('success');

    expect($app->fresh()->status)->toBe(PklApplicationStatus::Approved);
});

test('admin can reject a student application with reason', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $studentUser = User::factory()->create();
    $student = Student::create([
        'user_id' => $studentUser->id,
        'nis' => '12345',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $app = PklApplication::create([
        'student_id' => $student->id,
        'industry_id' => $this->industry->id,
        'academic_year_id' => $this->academicYear->id,
        'status' => PklApplicationStatus::Submitted,
    ]);

    $response = $this->actingAs($admin)->put("/pkl/applications/{$app->id}/verify", [
        'status' => 'rejected',
        'rejection_reason' => 'Kuota mitra industri sudah penuh untuk jurusan ini.',
    ]);

    $response->assertRedirect('/pkl/applications');
    $response->assertSessionHas('success');

    $refreshed = $app->fresh();
    expect($refreshed->status)->toBe(PklApplicationStatus::Rejected)
        ->and($refreshed->rejection_reason)->toBe('Kuota mitra industri sudah penuh untuk jurusan ini.');
});

test('admin can assign school teacher and industry supervisor', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $studentUser = User::factory()->create();
    $student = Student::create([
        'user_id' => $studentUser->id,
        'nis' => '12345',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $teacherUser = User::factory()->create();
    $teacher = Teacher::create([
        'user_id' => $teacherUser->id,
        'nip' => '19800101',
    ]);

    $indSupUser = User::factory()->create();
    $indSup = IndustrySupervisor::create([
        'user_id' => $indSupUser->id,
        'industry_id' => $this->industry->id,
        'position' => 'Lead Engineer',
    ]);

    $app = PklApplication::create([
        'student_id' => $student->id,
        'industry_id' => $this->industry->id,
        'academic_year_id' => $this->academicYear->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    $response = $this->actingAs($admin)->put("/pkl/applications/{$app->id}/assign-supervisors", [
        'teacher_id' => $teacher->id,
        'industry_supervisor_id' => $indSup->id,
    ]);

    $response->assertRedirect('/pkl/applications');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('pkl_supervisors', [
        'pkl_application_id' => $app->id,
        'teacher_id' => $teacher->id,
        'industry_supervisor_id' => $indSup->id,
    ]);
});
