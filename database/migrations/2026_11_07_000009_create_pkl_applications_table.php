<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkl_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('industry_id')->constrained('industries');
            $table->foreignId('academic_year_id')->constrained('academic_years');
            $table->enum('status', ['submitted', 'approved', 'rejected'])->default('submitted')->index();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'academic_year_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkl_applications');
    }
};

