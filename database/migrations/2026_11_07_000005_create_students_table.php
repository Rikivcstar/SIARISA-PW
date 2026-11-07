<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('nis', 20)->unique();     // Nomor Induk Siswa
            $table->string('nisn', 20)->nullable()->unique(); // Nomor Induk Siswa Nasional
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->foreignId('major_id')->constrained('majors');
            $table->unsignedBigInteger('ppdb_applicant_id')->nullable(); // FK added later when ppdb_applicants table exists
            $table->enum('status', ['active', 'inactive', 'graduated'])->default('active')->index();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

