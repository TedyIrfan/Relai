<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add columns for tracking password algorithm version
        Schema::table('users', function (Blueprint $table) {
            $table->string('password_algorithm', 20)->default('argon2id')->after('password');
            $table->boolean('password_reset_required')->default(false)->after('password_algorithm');
            $table->timestamp('password_changed_at')->nullable()->after('password_reset_required');
        });

        // Update existing users
        $users = User::all();
        foreach ($users as $user) {
            // Check if password is bcrypt (starts with $2y$)
            if (str_starts_with($user->password, '$2y$')) {
                $user->update([
                    'password_algorithm' => 'bcrypt',
                    'password_changed_at' => now()
                ]);
            } else {
                $user->update([
                    'password_algorithm' => 'argon2id',
                    'password_changed_at' => now()
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['password_algorithm', 'password_reset_required', 'password_changed_at']);
        });
    }
};
