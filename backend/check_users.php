<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

// Check users in database
echo "=== USERS IN DATABASE ===\n";
$users = \App\Models\User::all();

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Username: {$user->username}\n";
    echo "Email: {$user->email}\n";
    echo "Jabatan: {$user->jabatan}\n";
    echo "Created: {$user->created_at}\n";
    echo "Last Login: {$user->last_login}\n";
    echo "------------------------\n";
}

if ($users->isEmpty()) {
    echo "No users found in database.\n";
    echo "Running seeder...\n";

    // Run the user seeder
    try {
        \Artisan::call('db:seed', ['--class' => 'DatabaseSeeder']);
        echo "Seeder completed successfully!\n";
    } catch (\Exception $e) {
        echo "Seeder failed: " . $e->getMessage() . "\n";
    }
}

echo "\nTotal users: " . $users->count() . "\n";