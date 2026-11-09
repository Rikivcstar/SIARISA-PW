<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Industry;
use Illuminate\Database\Seeder;

class IndustrySeeder extends Seeder
{
    public function run(): void
    {
        $industries = [
            [
                'name' => 'PT Telkom Indonesia (Witel Bogor)',
                'address' => 'Jl. Pajajaran No. 37, Babakan, Bogor Tengah',
                'city' => 'Bogor',
                'phone' => '0251-8321000',
                'email' => 'pkl@telkombogor.co.id',
                'contact_person' => 'Bambang Sudarmono (HRD)',
                'contact_phone' => '081289112233',
                'is_active' => true,
            ],
            [
                'name' => 'Creative Media Studio Art',
                'address' => 'Ruko Cibubur Times Square Blok B2 No. 12',
                'city' => 'Bogor',
                'phone' => '021-84591234',
                'email' => 'career@creativemedia.id',
                'contact_person' => 'Dina Rosdiana (Creative Lead)',
                'contact_phone' => '085712345678',
                'is_active' => true,
            ],
            [
                'name' => 'BPRS Syariah Al-Falah',
                'address' => 'Jl. Raya Cariu No. 88, Cariu',
                'city' => 'Bogor',
                'phone' => '021-89931122',
                'email' => 'sdm@bprsfalah.co.id',
                'contact_person' => 'H. Ahmad Fauzi (Manajer Operasional)',
                'contact_phone' => '081398765432',
                'is_active' => true,
            ],
            [
                'name' => 'Kantor Kecamatan Cariu',
                'address' => 'Jl. Brigjen Dharsono No. 1, Cariu',
                'city' => 'Bogor',
                'phone' => '021-89932001',
                'email' => 'kecamatan.cariu@bogorkab.go.id',
                'contact_person' => 'Ibu Siti Maryam (Kasubag Kepegawaian)',
                'contact_phone' => '081299887766',
                'is_active' => true,
            ],
            [
                'name' => 'Percetakan & Desain Grafis Risalah Grafika',
                'address' => 'Jl. Raya Jonggol - Cariu KM 5',
                'city' => 'Bogor',
                'phone' => '021-89945000',
                'email' => 'order@risalahgrafika.com',
                'contact_person' => 'Rian Hidayat',
                'contact_phone' => '087811223344',
                'is_active' => true,
            ],
        ];

        foreach ($industries as $item) {
            Industry::firstOrCreate(
                ['name' => $item['name']],
                $item,
            );
        }

        $this->command->info('IndustrySeeder: 5 DUDI mitra seeded.');
    }
}
