<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Master\AcademicYearController;
use App\Http\Controllers\Master\IndustryController;
use App\Http\Controllers\Master\StudentController;
use App\Http\Controllers\Master\TeacherController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    // Custom Alert Demo Showcase
    Route::inertia('demo/alerts', 'demo/alerts')->name('demo.alerts');

    // Master Data Routes
    Route::prefix('master')->name('master.')->group(function () {
        Route::resource('industries', IndustryController::class)->except(['create', 'edit', 'show']);

        // Academic Years & Classrooms
        Route::resource('academic-years', AcademicYearController::class)->except(['create', 'edit', 'show']);
        Route::post('academic-years/{academicYear}/toggle-active', [AcademicYearController::class, 'toggleActive'])
            ->name('academic-years.toggle-active');
        Route::post('classrooms', [AcademicYearController::class, 'storeClassroom'])
            ->name('classrooms.store');
        Route::put('classrooms/{classroom}', [AcademicYearController::class, 'updateClassroom'])
            ->name('classrooms.update');
        Route::delete('classrooms/{classroom}', [AcademicYearController::class, 'destroyClassroom'])
            ->name('classrooms.destroy');

        // Teachers & Students
        Route::resource('teachers', TeacherController::class)->except(['create', 'edit', 'show']);
        Route::resource('students', StudentController::class)->except(['create', 'edit', 'show']);
    });
});

require __DIR__.'/settings.php';
