<?php

declare(strict_types=1);

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

test('unauthenticated user cannot access academic years', function (): void {
    $response = $this->get('/master/academic-years');
    $response->assertRedirect('/login');
});

test('admin can view academic years and classrooms', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $year = AcademicYear::create([
        'name' => '2026/2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->get('/master/academic-years');
    $response->assertOk();
});

test('admin can create a new academic year', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $data = [
        'name' => '2027/2028',
        'start_date' => '2027-07-01',
        'end_date' => '2028-06-30',
        'is_active' => false,
    ];

    $response = $this->actingAs($admin)->post('/master/academic-years', $data);

    $response->assertRedirect('/master/academic-years');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('academic_years', [
        'name' => '2027/2028',
    ]);
});

test('admin can toggle active academic year', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $oldYear = AcademicYear::create([
        'name' => '2025/2026',
        'start_date' => '2025-07-01',
        'end_date' => '2026-06-30',
        'is_active' => true,
    ]);

    $newYear = AcademicYear::create([
        'name' => '2026/2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
        'is_active' => false,
    ]);

    $response = $this->actingAs($admin)->post("/master/academic-years/{$newYear->id}/toggle-active");

    $response->assertRedirect("/master/academic-years?academic_year_id={$newYear->id}");
    $response->assertSessionHas('success');

    expect($newYear->fresh()->is_active)->toBeTrue()
        ->and($oldYear->fresh()->is_active)->toBeFalse();
});

test('admin can create, update, and delete a classroom', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $year = AcademicYear::create([
        'name' => '2026/2027',
        'start_date' => '2026-07-01',
        'end_date' => '2027-06-30',
        'is_active' => true,
    ]);

    $major = Major::first();

    // Create Classroom
    $response = $this->actingAs($admin)->post('/master/classrooms', [
        'name' => 'XI DKV 1',
        'academic_year_id' => $year->id,
        'major_id' => $major->id,
    ]);

    $response->assertRedirect("/master/academic-years?academic_year_id={$year->id}");
    $this->assertDatabaseHas('classrooms', [
        'name' => 'XI DKV 1',
        'academic_year_id' => $year->id,
    ]);

    $classroom = Classroom::first();

    // Update Classroom
    $updateResponse = $this->actingAs($admin)->put("/master/classrooms/{$classroom->id}", [
        'name' => 'XI DKV Unggulan',
        'academic_year_id' => $year->id,
        'major_id' => $major->id,
    ]);

    $updateResponse->assertRedirect("/master/academic-years?academic_year_id={$year->id}");
    $this->assertDatabaseHas('classrooms', [
        'name' => 'XI DKV Unggulan',
    ]);

    // Delete Classroom
    $deleteResponse = $this->actingAs($admin)->delete("/master/classrooms/{$classroom->id}");
    $deleteResponse->assertRedirect("/master/academic-years?academic_year_id={$year->id}");
    $this->assertDatabaseMissing('classrooms', [
        'id' => $classroom->id,
    ]);
});
