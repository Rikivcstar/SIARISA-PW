<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pkl_application_id')->constrained('pkl_applications')->cascadeOnDelete();
            $table->date('date');
            $table->text('activity');
            $table->string('location')->nullable();
            $table->enum('status', ['pending', 'validated', 'rejected'])->default('pending')->index();
            $table->timestamp('validated_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['pkl_application_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journals');
    }
};
