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
        Schema::create('sbm_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sbm_file_id')->constrained('sbm_files')->onDelete('cascade');
            $table->string('sheet_name', 255);
            $table->integer('sheet_order');
            $table->integer('total_rows')->default(0);
            $table->string('status', 20)->default('active'); // active, archived
            $table->json('column_mapping')->nullable(); // Store column mapping info
            $table->timestamps();

            // Indexes
            $table->foreign('sbm_file_id')->references('id')->on('sbm_files')->onDelete('cascade');
            $table->index(['sbm_file_id', 'sheet_order']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sbm_sheets');
    }
};
