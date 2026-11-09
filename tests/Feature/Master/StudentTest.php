<?php

declare(strict_types=1);

use App\Actions\Master\CreateStudentAction;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Major;
use App\Models\User;
use Database\Seeders\MajorSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(MajorSeeder::class);
});

test('unauthenticated user cannot access master students', function (): void {
    $response = $this->get('/master/students');
    $response->assertRedirect('/login');
});

test('admin can view students list', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/master/students');
    $response->assertOk();
});

test('admin can create a new student', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $major = Major::first();
    $year = AcademicYear::create([
        'name' => '2026/2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
        'is_active' => true,
    ]);

    $classroom = Classroom::create([
        'name' => 'XI DKV 1',
        'academic_year_id' => $year->id,
        'major_id' => $major->id,
    ]);

    $data = [
        'name' => 'Rian Firmansyah',
        'email' => 'rian@siswa.siarisa.sch.id',
        'password' => 'password123',
        'nis' => '242510099',
        'nisn' => '0079998881',
        'classroom_id' => $classroom->id,
        'major_id' => $major->id,
        'status' => 'active',
        'phone' => '081234567899',
        'address' => 'Kp. Babakan Cariu',
    ];

    $response = $this->actingAs($admin)->post('/master/students', $data);

    $response->assertRedirect('/master/students');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'email' => 'rian@siswa.siarisa.sch.id',
        'name' => 'Rian Firmansyah',
    ]);

    $this->assertDatabaseHas('students', [
        'nis' => '242510099',
        'nisn' => '0079998881',
        'classroom_id' => $classroom->id,
        'status' => 'active',
    ]);

    $createdUser = User::where('email', 'rian@siswa.siarisa.sch.id')->first();
    expect($createdUser->hasRole('student'))->toBeTrue();
});

test('admin can update a student', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $major = Major::first();

    /** @var CreateStudentAction $action */
    $action = app(CreateStudentAction::class);
    $student = $action->execute([
        'name' => 'Siswa Awal',
        'email' => 'siswaawal@siarisa.sch.id',
        'password' => 'password',
        'nis' => '11111',
        'major_id' => $major->id,
        'status' => 'active',
    ]);

    $updateData = [
        'name' => 'Siswa Diperbarui',
        'email' => 'siswabaru@siarisa.sch.id',
        'password' => '',
        'nis' => '22222',
        'nisn' => '0098765432',
        'major_id' => $major->id,
        'classroom_id' => null,
        'status' => 'inactive',
        'phone' => '0858111222',
        'address' => 'Jl. Pahlawan',
    ];

    $response = $this->actingAs($admin)->put("/master/students/{$student->id}", $updateData);

    $response->assertRedirect('/master/students');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'id' => $student->user_id,
        'name' => 'Siswa Diperbarui',
        'email' => 'siswabaru@siarisa.sch.id',
    ]);

    $this->assertDatabaseHas('students', [
        'id' => $student->id,
        'nis' => '22222',
        'nisn' => '0098765432',
        'status' => 'inactive',
    ]);
});

test('admin can delete a student and user account', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $major = Major::first();

    /** @var CreateStudentAction $action */
    $action = app(CreateStudentAction::class);
    $student = $action->execute([
        'name' => 'Siswa Hapus',
        'email' => 'siswahapus@siarisa.sch.id',
        'password' => 'password',
        'nis' => '33333',
        'major_id' => $major->id,
    ]);

    $userId = $student->user_id;
    $studentId = $student->id;

    $response = $this->actingAs($admin)->delete("/master/students/{$studentId}");

    $response->assertRedirect('/master/students');
    $response->assertSessionHas('success');

    $this->assertDatabaseMissing('students', ['id' => $studentId]);
    $this->assertDatabaseMissing('users', ['id' => $userId]);
});
