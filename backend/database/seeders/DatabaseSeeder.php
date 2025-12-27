<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\SbmDetailsSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            KategoriAnggaranSeeder::class,
            MasterRKASeeder::class,
            SbmDetailsSeeder::class,
        ]);

        $this->command->info('🚀 Database seeding completed!');
    }
}
