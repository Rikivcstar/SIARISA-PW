<?php

declare(strict_types=1);

use App\Models\Industry;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('unauthenticated user cannot access master industries', function (): void {
    $response = $this->get('/master/industries');
    $response->assertRedirect('/login');
});

test('admin can view industries list', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $industry = Industry::create([
        'name' => 'PT Inovasi Digital',
        'address' => 'Jl. Sudirman No. 1',
        'city' => 'Bogor',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->get('/master/industries');

    $response->assertOk();
});

test('admin can create a new industry', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $data = [
        'name' => 'PT Solusi Teknologi Nusantara',
        'address' => 'Jl. Pajajaran No. 45',
        'city' => 'Bogor',
        'phone' => '0251-123456',
        'email' => 'info@solusitek.id',
        'contact_person' => 'Budi Santoso',
        'contact_phone' => '081234567890',
        'is_active' => true,
    ];

    $response = $this->actingAs($admin)->post('/master/industries', $data);

    $response->assertRedirect('/master/industries');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('industries', [
        'name' => 'PT Solusi Teknologi Nusantara',
        'city' => 'Bogor',
        'email' => 'info@solusitek.id',
    ]);
});

test('validation prevents creating industry with missing required fields', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->actingAs($admin)->post('/master/industries', [
        'name' => '',
        'address' => '',
    ]);

    $response->assertSessionHasErrors(['name', 'address']);
});

test('admin can update an existing industry', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $industry = Industry::create([
        'name' => 'Perusahaan Lama',
        'address' => 'Alamat Lama',
        'city' => 'Cariu',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->put("/master/industries/{$industry->id}", [
        'name' => 'Perusahaan Diperbarui',
        'address' => 'Alamat Baru',
        'city' => 'Bogor Timur',
        'is_active' => false,
    ]);

    $response->assertRedirect('/master/industries');
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('industries', [
        'id' => $industry->id,
        'name' => 'Perusahaan Diperbarui',
        'is_active' => false,
    ]);
});

test('admin can delete an industry', function (): void {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $industry = Industry::create([
        'name' => 'Perusahaan Yang Akan Dihapus',
        'address' => 'Jl. Test No. 9',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->delete("/master/industries/{$industry->id}");

    $response->assertRedirect('/master/industries');
    $response->assertSessionHas('success');

    $this->assertDatabaseMissing('industries', [
        'id' => $industry->id,
    ]);
});
