<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Order matters: roles must exist before assigning to users.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            AcademicYearSeeder::class,
            MajorSeeder::class,
            SettingSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
