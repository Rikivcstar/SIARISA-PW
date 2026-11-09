<?php

declare(strict_types=1);

use App\Actions\Master\CreateTeacherAction;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('unauthenticated user cannot access master teachers', function (): void {
    $response = $this->get('/master/teachers');
    $response->assertRedirect('/login');
});

test('admin can view teachers list', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->get('/master/teachers');
    $response->assertOk();
});

test('admin can create a new teacher', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $data = [
        'name' => 'Irwan Setiawan, S.T.',
        'email' => 'irwan@siarisa.sch.id',
        'password' => 'password123',
        'nip' => '199201012019031001',
        'phone' => '081234567800',
        'address' => 'Jl. Raya Cariu No. 10',
    ];

    $response = $this->actingAs($admin)->post('/master/teachers', $data);

    $response->assertRedirect('/master/teachers');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'email' => 'irwan@siarisa.sch.id',
        'name' => 'Irwan Setiawan, S.T.',
    ]);

    $this->assertDatabaseHas('teachers', [
        'nip' => '199201012019031001',
        'phone' => '081234567800',
    ]);

    $createdUser = User::where('email', 'irwan@siarisa.sch.id')->first();
    expect($createdUser->hasRole('teacher'))->toBeTrue();
});

test('admin can update a teacher', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    /** @var CreateTeacherAction $action */
    $action = app(CreateTeacherAction::class);
    $teacher = $action->execute([
        'name' => 'Guru Lama',
        'email' => 'gurulama@siarisa.sch.id',
        'password' => 'password',
        'nip' => '123456789',
        'phone' => '08123456789',
        'address' => 'Alamat Lama',
    ]);

    $updateData = [
        'name' => 'Guru Baru, M.Pd.',
        'email' => 'gurubaru@siarisa.sch.id',
        'password' => '',
        'nip' => '987654321',
        'phone' => '08198765432',
        'address' => 'Alamat Baru',
    ];

    $response = $this->actingAs($admin)->put("/master/teachers/{$teacher->id}", $updateData);

    $response->assertRedirect('/master/teachers');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'id' => $teacher->user_id,
        'name' => 'Guru Baru, M.Pd.',
        'email' => 'gurubaru@siarisa.sch.id',
    ]);

    $this->assertDatabaseHas('teachers', [
        'id' => $teacher->id,
        'nip' => '987654321',
        'phone' => '08198765432',
    ]);
});

test('admin can delete a teacher and user account', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    /** @var CreateTeacherAction $action */
    $action = app(CreateTeacherAction::class);
    $teacher = $action->execute([
        'name' => 'Guru Hapus',
        'email' => 'guruhapus@siarisa.sch.id',
        'password' => 'password',
    ]);

    $userId = $teacher->user_id;
    $teacherId = $teacher->id;

    $response = $this->actingAs($admin)->delete("/master/teachers/{$teacherId}");

    $response->assertRedirect('/master/teachers');
    $response->assertSessionHas('success');

    $this->assertDatabaseMissing('teachers', ['id' => $teacherId]);
    $this->assertDatabaseMissing('users', ['id' => $userId]);
});
