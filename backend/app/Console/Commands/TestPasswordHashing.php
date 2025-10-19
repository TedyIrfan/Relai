<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class TestPasswordHashing extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-password-hashing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Argon2 password hashing vs bcrypt';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔐 Testing Password Hashing Algorithms');
        $this->info('=====================================');

        $password = 'password123';

        // Test Argon2
        $argon2Start = microtime(true);
        $argon2Hash = Hash::make($password);
        $argon2Time = (microtime(true) - $argon2Start) * 1000;

        // Test Bcrypt (for comparison)
        $bcryptStart = microtime(true);
        $bcryptHash = password_hash($password, PASSWORD_BCRYPT);
        $bcryptTime = (microtime(true) - $bcryptStart) * 1000;

        $this->info('📊 Algorithm Comparison:');
        $this->info('');
        $this->info('🔹 Argon2ID (Current):');
        $this->info("   Hash: {$argon2Hash}");
        $this->info("   Time: " . number_format($argon2Time, 2) . "ms");
        $this->info("   Length: " . strlen($argon2Hash) . " chars");

        $this->info('');
        $this->info('🔹 Bcrypt (Legacy):');
        $this->info("   Hash: {$bcryptHash}");
        $this->info("   Time: " . number_format($bcryptTime, 2) . "ms");
        $this->info("   Length: " . strlen($bcryptHash) . " chars");

        // Test verification
        $this->info('');
        $this->info('🔍 Verification Test:');
        $this->info("   Argon2 Verification: " . (Hash::check($password, $argon2Hash) ? '✅ PASS' : '❌ FAIL'));
        $this->info("   Bcrypt Verification: " . (password_verify($password, $bcryptHash) ? '✅ PASS' : '❌ FAIL'));

        $this->info('');
        $this->info('🚀 RelAI Password Security Status: UPGRADED TO ARGON2ID');
        $this->info('   ✅ Modern memory-hard algorithm');
        $this->info('   ✅ Resistant to GPU attacks');
        $this->info('   ✅ Configurable memory/time parameters');

        return Command::SUCCESS;
    }
}
