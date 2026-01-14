<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sbm_details', function (Blueprint $table) {
            $table->id();
            $table->string('category', 100)->index();
            $table->string('sub_category', 100)->nullable()->index();
            $table->json('data');
            $table->string('currency', 10)->default('IDR')->index();
            $table->timestamps();

            // Indexes for better query performance
            $table->index(['category', 'sub_category'], 'idx_category_sub');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sbm_details');
    }
};
