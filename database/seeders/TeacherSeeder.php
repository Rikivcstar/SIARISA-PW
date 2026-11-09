<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Actions\Master\CreateTeacherAction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder
{
    public function run(CreateTeacherAction $action): void
    {
        $teachers = [
            [
                'name' => 'Ahmad Fauzi, S.Kom.',
                'email' => 'guru.fauzi@siarisa.sch.id',
                'password' => 'password',
                'nip' => '198503152010011012',
                'phone' => '081234567890',
                'address' => 'Kp. Babakan RT 02/RW 04, Kec. Cariu, Kab. Bogor',
            ],
            [
                'name' => 'Siti Rahmawati, S.Pd.',
                'email' => 'guru.rahma@siarisa.sch.id',
                'password' => 'password',
                'nip' => '199008202014022005',
                'phone' => '081398765432',
                'address' => 'Jl. Raya Cariu No. 45, Cariu, Bogor',
            ],
            [
                'name' => 'Dedi Suryadi, S.E.',
                'email' => 'guru.dedi@siarisa.sch.id',
                'password' => 'password',
                'nip' => '198711102012011008',
                'phone' => '085712349876',
                'address' => 'Desa Bantar Kuning, Cariu, Bogor',
            ],
        ];

        foreach ($teachers as $item) {
            if (! User::where('email', $item['email'])->exists()) {
                $action->execute($item);
            }
        }

        $this->command->info('Teachers seeded.');
    }
}
