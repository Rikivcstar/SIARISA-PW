<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@siarisa.sch.id'],
            [
                'name'     => 'Administrator',
                'email'    => 'admin@siarisa.sch.id',
                'password' => Hash::make('password'),
            ],
        );

        $admin->assignRole('admin');

        $this->command->info("Admin user seeded: admin@siarisa.sch.id");
        $this->command->warn("IMPORTANT: Change the admin password after first login!");
    }
}

