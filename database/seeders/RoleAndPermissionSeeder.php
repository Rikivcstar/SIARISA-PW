<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ─── Create Roles ────────────────────────────────────────────────────
        // Role names must match SKILL.md Section 6 exactly
        $roles = [
            'admin',
            'headmaster',
            'teacher',
            'student',
            'industry_supervisor',
            'applicant',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $this->command->info('Roles seeded: ' . implode(', ', $roles));
    }
}

