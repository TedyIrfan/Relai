<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default user for testing
        User::updateOrCreate(
            ['username' => 'eselon1'],
            [
                'name' => 'Eselon 1 User',
                'username' => 'eselon1',
                'email' => 'eselon1@relai.gov.id',
                'password' => Hash::make('eselon1'),
                'jabatan' => 'Eselon 1',
                'last_login' => now(),
            ]
        );

        // Create additional test users
        User::updateOrCreate(
            ['username' => 'eselon2'],
            [
                'name' => 'Eselon 2 User',
                'username' => 'eselon2',
                'email' => 'eselon2@relai.gov.id',
                'password' => Hash::make('eselon2'),
                'jabatan' => 'Eselon 2',
                'last_login' => now(),
            ]
        );

        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'email' => 'admin@relai.gov.id',
                'password' => Hash::make('admin123'),
                'jabatan' => 'Administrator',
                'last_login' => now(),
            ]
        );

        User::updateOrCreate(
            ['username' => 'staff'],
            [
                'name' => 'Staff User',
                'username' => 'staff',
                'email' => 'staff@relai.gov.id',
                'password' => Hash::make('staff123'),
                'jabatan' => 'Staff',
                'last_login' => now(),
            ]
        );

        User::updateOrCreate(
            ['username' => 'eselon3'],
            [
                'name' => 'Eselon 3 User',
                'username' => 'eselon3',
                'email' => 'eselon3@relai.gov.id',
                'password' => Hash::make('eselon3'),
                'jabatan' => 'Eselon 3',
                'last_login' => now(),
            ]
        );

        User::updateOrCreate(
            ['username' => 'eselon4'],
            [
                'name' => 'Eselon 4 User',
                'username' => 'eselon4',
                'email' => 'eselon4@relai.gov.id',
                'password' => Hash::make('eselon4'),
                'jabatan' => 'Eselon 4',
                'last_login' => now(),
            ]
        );

        $this->command->info('✅ Users created successfully!');
        $this->command->info('📝 Login Credentials:');
        $this->command->info('   • eselon1 / eselon1');
        $this->command->info('   • eselon2 / eselon2');
        $this->command->info('   • eselon3 / eselon3');
        $this->command->info('   • eselon4 / eselon4');
        $this->command->info('   • admin / admin123');
        $this->command->info('   • staff / staff123');
    }
}