<?php

declare(strict_types=1);

namespace Tests\Feature\Pkl;

use App\Enums\JournalStatus;
use App\Enums\PklApplicationStatus;
use App\Models\AcademicYear;
use App\Models\Industry;
use App\Models\Journal;
use App\Models\Major;
use App\Models\PklApplication;
use App\Models\PklSupervisor;
use App\Models\Student;
use App\Models\Teacher;
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

test('unauthenticated user cannot access journals', function (): void {
    $response = $this->get('/pkl/journal');
    $response->assertRedirect('/login');
});

test('student can view their journal page', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99002',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get('/pkl/journal');
    $response->assertOk();
});

test('student can submit a new daily journal', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99002',
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

    $response = $this->actingAs($user)->post('/pkl/journal', [
        'date' => $today,
        'location' => 'Divisi Desain Grafis',
        'activity' => 'Mempelajari pembuatan asset promosi dengan Figma dan slicing ke format SVG.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('journals', [
        'pkl_application_id' => $pklApp->id,
        'location' => 'Divisi Desain Grafis',
        'status' => JournalStatus::Pending->value,
    ]);
});

test('student can update pending journal', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99002',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    $journal = Journal::create([
        'pkl_application_id' => $pklApp->id,
        'date' => Carbon::now()->toDateString(),
        'activity' => 'Draft kegiatan yang akan diperbarui oleh siswa.',
        'status' => JournalStatus::Pending,
    ]);

    $response = $this->actingAs($user)->put("/pkl/journal/{$journal->id}", [
        'activity' => 'Kegiatan yang sudah diperjelas dan dilengkapi detail tugas praktiknya.',
        'location' => 'Studio Foto',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('journals', [
        'id' => $journal->id,
        'location' => 'Studio Foto',
        'status' => JournalStatus::Pending->value,
    ]);
});

test('student can delete pending journal', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99002',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    $journal = Journal::create([
        'pkl_application_id' => $pklApp->id,
        'date' => Carbon::now()->toDateString(),
        'activity' => 'Kegiatan yang salah input dan ingin dihapus.',
        'status' => JournalStatus::Pending,
    ]);

    $response = $this->actingAs($user)->delete("/pkl/journal/{$journal->id}");

    $response->assertRedirect();
    $this->assertDatabaseMissing('journals', ['id' => $journal->id]);
});

test('teacher can view supervisor validation page', function (): void {
    $teacherUser = User::factory()->create();
    $teacherUser->assignRole('teacher');

    Teacher::create([
        'user_id' => $teacherUser->id,
        'nip' => '198501012010011005',
    ]);

    $response = $this->actingAs($teacherUser)->get('/pkl/supervisor/journals');
    $response->assertOk();
});

test('teacher can validate student journal', function (): void {
    $teacherUser = User::factory()->create();
    $teacherUser->assignRole('teacher');

    $teacher = Teacher::create([
        'user_id' => $teacherUser->id,
        'nip' => '198501012010011005',
    ]);

    $studentUser = User::factory()->create();
    $studentUser->assignRole('student');

    $student = Student::create([
        'user_id' => $studentUser->id,
        'nis' => '99002',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    PklSupervisor::create([
        'pkl_application_id' => $pklApp->id,
        'teacher_id' => $teacher->id,
    ]);

    $journal = Journal::create([
        'pkl_application_id' => $pklApp->id,
        'date' => Carbon::now()->toDateString(),
        'activity' => 'Kegiatan lengkap siap diverifikasi oleh guru pembimbing.',
        'status' => JournalStatus::Pending,
    ]);

    $response = $this->actingAs($teacherUser)->put("/pkl/supervisor/journals/{$journal->id}/validate", [
        'status' => 'validated',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('journals', [
        'id' => $journal->id,
        'status' => JournalStatus::Validated->value,
    ]);
    $this->assertNotNull($journal->fresh()->validated_at);
});

test('teacher can reject student journal with feedback reason', function (): void {
    $teacherUser = User::factory()->create();
    $teacherUser->assignRole('teacher');

    $teacher = Teacher::create([
        'user_id' => $teacherUser->id,
        'nip' => '198501012010011005',
    ]);

    $studentUser = User::factory()->create();
    $studentUser->assignRole('student');

    $student = Student::create([
        'user_id' => $studentUser->id,
        'nis' => '99002',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    PklSupervisor::create([
        'pkl_application_id' => $pklApp->id,
        'teacher_id' => $teacher->id,
    ]);

    $journal = Journal::create([
        'pkl_application_id' => $pklApp->id,
        'date' => Carbon::now()->toDateString(),
        'activity' => 'Kegiatan yang terlalu singkat dan kurang informatif.',
        'status' => JournalStatus::Pending,
    ]);

    $response = $this->actingAs($teacherUser)->put("/pkl/supervisor/journals/{$journal->id}/validate", [
        'status' => 'rejected',
        'rejection_reason' => 'Mohon tambahkan nama tools dan software yang digunakan dalam kegiatan ini.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('journals', [
        'id' => $journal->id,
        'status' => JournalStatus::Rejected->value,
        'rejection_reason' => 'Mohon tambahkan nama tools dan software yang digunakan dalam kegiatan ini.',
    ]);
});

test('student cannot edit or delete validated journal', function (): void {
    $user = User::factory()->create();
    $user->assignRole('student');

    $student = Student::create([
        'user_id' => $user->id,
        'nis' => '99002',
        'major_id' => $this->major->id,
        'status' => 'active',
    ]);

    $pklApp = PklApplication::create([
        'student_id' => $student->id,
        'academic_year_id' => $this->academicYear->id,
        'industry_id' => $this->industry->id,
        'status' => PklApplicationStatus::Approved,
    ]);

    $journal = Journal::create([
        'pkl_application_id' => $pklApp->id,
        'date' => Carbon::now()->toDateString(),
        'activity' => 'Kegiatan yang sudah disetujui resmi oleh pembimbing sekolah.',
        'status' => JournalStatus::Validated,
        'validated_at' => Carbon::now(),
    ]);

    $updateResponse = $this->actingAs($user)->put("/pkl/journal/{$journal->id}", [
        'activity' => 'Mencoba mengedit jurnal yang sudah tervalidasi.',
    ]);
    $updateResponse->assertForbidden();

    $deleteResponse = $this->actingAs($user)->delete("/pkl/journal/{$journal->id}");
    $deleteResponse->assertForbidden();

    $this->assertDatabaseHas('journals', [
        'id' => $journal->id,
        'activity' => 'Kegiatan yang sudah disetujui resmi oleh pembimbing sekolah.',
    ]);
});
