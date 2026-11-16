<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Industry;
use App\Models\IndustrySupervisor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class IndustrySupervisorSeeder extends Seeder
{
    public function run(): void
    {
        $telkom = Industry::where('name', 'like', '%Telkom%')->first();
        $media = Industry::where('name', 'like', '%Creative Media%')->first();
        $bank = Industry::where('name', 'like', '%BPRS%')->first();

        $supervisors = [
            [
                'name' => 'Ir. Hendra Wijaya',
                'email' => 'pembimbing.telkom@dudi.id',
                'industry_id' => $telkom?->id,
                'position' => 'Head of Network Operations',
                'phone' => '081122334455',
            ],
            [
                'name' => 'Maya Safitri, S.Ds.',
                'email' => 'pembimbing.media@dudi.id',
                'industry_id' => $media?->id,
                'position' => 'Senior Art Director',
                'phone' => '081233445566',
            ],
            [
                'name' => 'Rahmat Hidayat, S.E.',
                'email' => 'pembimbing.bprs@dudi.id',
                'industry_id' => $bank?->id,
                'position' => 'Branch Operations Manager',
                'phone' => '081344556677',
            ],
        ];

        foreach ($supervisors as $item) {
            if (! $item['industry_id']) {
                continue;
            }

            $user = User::firstOrCreate(
                ['email' => $item['email']],
                [
                    'name' => $item['name'],
                    'password' => Hash::make('password'),
                ]
            );

            if (! $user->hasRole('industry_supervisor')) {
                $user->assignRole('industry_supervisor');
            }

            IndustrySupervisor::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'industry_id' => $item['industry_id'],
                    'position' => $item['position'],
                    'phone' => $item['phone'],
                ]
            );
        }

        $this->command->info('Industry supervisors seeded.');
    }
}
