<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('majors', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100);            // e.g. "Desain Komunikasi Visual"
            $table->string('code', 10)->unique();   // e.g. "DKV", "MPLB", "LPS"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('majors');
    }
};
