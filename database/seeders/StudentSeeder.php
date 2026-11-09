<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Actions\Master\CreateStudentAction;
use App\Models\Classroom;
use App\Models\Major;
use App\Models\User;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(CreateStudentAction $action): void
    {
        $dkv = Major::where('code', 'DKV')->first();
        $mplb = Major::where('code', 'MPLB')->first();
        $lps = Major::where('code', 'LPS')->first();

        $classDkv = Classroom::where('name', 'XI DKV 1')->first();
        $classMplb = Classroom::where('name', 'XI MPLB 1')->first();
        $classLps = Classroom::where('name', 'XI LPS 1')->first();

        $students = [
            [
                'name' => 'Muhammad Rizky Pratama',
                'email' => 'rizky@siswa.siarisa.sch.id',
                'password' => 'password',
                'nis' => '242510001',
                'nisn' => '0071234501',
                'classroom_id' => $classDkv?->id,
                'major_id' => $dkv?->id ?? 1,
                'status' => 'active',
                'phone' => '08129998881',
                'address' => 'Kp. Cariu Tengah RT 01/RW 02, Bogor',
            ],
            [
                'name' => 'Nabila Azzahra Putri',
                'email' => 'nabila@siswa.siarisa.sch.id',
                'password' => 'password',
                'nis' => '242510002',
                'nisn' => '0071234502',
                'classroom_id' => $classDkv?->id,
                'major_id' => $dkv?->id ?? 1,
                'status' => 'active',
                'phone' => '08129998882',
                'address' => 'Jl. Pahlawan No. 12, Cariu, Bogor',
            ],
            [
                'name' => 'Fajar Nugraha Saputra',
                'email' => 'fajar@siswa.siarisa.sch.id',
                'password' => 'password',
                'nis' => '242510003',
                'nisn' => '0071234503',
                'classroom_id' => $classMplb?->id,
                'major_id' => $mplb?->id ?? 2,
                'status' => 'active',
                'phone' => '08129998883',
                'address' => 'Kp. Cibadak, Cariu, Bogor',
            ],
            [
                'name' => 'Siti Aisyah Humaira',
                'email' => 'aisyah@siswa.siarisa.sch.id',
                'password' => 'password',
                'nis' => '242510004',
                'nisn' => '0071234504',
                'classroom_id' => $classMplb?->id,
                'major_id' => $mplb?->id ?? 2,
                'status' => 'active',
                'phone' => '08129998884',
                'address' => 'Desa Kutamekar, Cariu, Bogor',
            ],
            [
                'name' => 'Bagas Dwi Santoso',
                'email' => 'bagas@siswa.siarisa.sch.id',
                'password' => 'password',
                'nis' => '242510005',
                'nisn' => '0071234505',
                'classroom_id' => $classLps?->id,
                'major_id' => $lps?->id ?? 3,
                'status' => 'active',
                'phone' => '08129998885',
                'address' => 'Kp. Mekarwangi RT 03/RW 01, Cariu, Bogor',
            ],
        ];

        foreach ($students as $item) {
            if (! User::where('email', $item['email'])->exists()) {
                $action->execute($item);
            }
        }

        $this->command->info('Students seeded.');
    }
}
