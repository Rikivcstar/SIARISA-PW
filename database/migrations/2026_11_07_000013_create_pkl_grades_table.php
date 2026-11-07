<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkl_grades', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pkl_application_id')->unique()->constrained('pkl_applications')->cascadeOnDelete();
            // Nilai 0–100 dengan 2 desimal
            $table->decimal('industry_grade', 5, 2)->nullable(); // 60% weight (default)
            $table->decimal('teacher_grade', 5, 2)->nullable();  // 40% weight (default)
            $table->decimal('final_grade', 5, 2)->nullable();    // Computed: (industry_grade * weight) + (teacher_grade * weight)
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkl_grades');
    }
};

