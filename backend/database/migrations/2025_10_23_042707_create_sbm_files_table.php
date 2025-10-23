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
        Schema::create('sbm_files', function (Blueprint $table) {
            $table->id();
            $table->string('file_name', 255);
            $table->string('original_filename', 255);
            $table->integer('total_sheets')->default(0);
            $table->integer('total_rows')->default(0);
            $table->string('uploaded_by', 100);
            $table->date('upload_date');
            $table->string('status', 20)->default('active'); // active, archived
            $table->text('description')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('upload_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sbm_files');
    }
};
