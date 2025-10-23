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
        Schema::create('sbm_sheet_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sbm_sheet_id')->constrained('sbm_sheets')->onDelete('cascade');
            $table->integer('row_number');
            $table->json('column_data'); // Dynamic column data
            $table->json('raw_data'); // All original data from Excel row
            $table->timestamps();

            // Indexes
            $table->foreign('sbm_sheet_id')->references('id')->on('sbm_sheets')->onDelete('cascade');
            $table->index(['sbm_sheet_id', 'row_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sbm_sheet_data');
    }
};
