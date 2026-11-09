<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pkl_application_id')->constrained('pkl_applications')->cascadeOnDelete();
            $table->date('date');
            $table->enum('status', ['present', 'permission', 'sick', 'absent'])->default('present')->index();
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['pkl_application_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
