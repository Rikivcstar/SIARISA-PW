<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Master\AcademicYearController;
use App\Http\Controllers\Master\IndustryController;
use App\Http\Controllers\Master\StudentController;
use App\Http\Controllers\Master\TeacherController;
use App\Http\Controllers\Pkl\AttendanceController;
use App\Http\Controllers\Pkl\JournalController;
use App\Http\Controllers\Pkl\PklApplicationController;
use App\Http\Controllers\Pkl\PklMonitoringController;
use App\Http\Controllers\Pkl\SupervisorJournalController;
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

    // Modul PKL (Praktik Kerja Lapangan)
    Route::prefix('pkl')->name('pkl.')->group(function () {
        Route::get('my-application', fn () => redirect()->route('pkl.applications.index'))->name('my-application');
        Route::get('applications', [PklApplicationController::class, 'index'])->name('applications.index');
        Route::post('applications', [PklApplicationController::class, 'store'])->name('applications.store');
        Route::put('applications/{application}/verify', [PklApplicationController::class, 'verify'])->name('applications.verify');
        Route::put('applications/{application}/assign-supervisors', [PklApplicationController::class, 'assignSupervisors'])->name('applications.assign-supervisors');
        Route::delete('applications/{application}', [PklApplicationController::class, 'destroy'])->name('applications.destroy');

        // Presensi & Absensi Siswa
        Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');
        Route::put('attendance/{attendance}', [AttendanceController::class, 'update'])->name('attendance.update');

        // Jurnal Kegiatan Harian Siswa
        Route::get('journal', [JournalController::class, 'index'])->name('journal.index');
        Route::post('journal', [JournalController::class, 'store'])->name('journal.store');
        Route::put('journal/{journal}', [JournalController::class, 'update'])->name('journal.update');
        Route::delete('journal/{journal}', [JournalController::class, 'destroy'])->name('journal.destroy');

        // Validasi Jurnal oleh Guru & Pembimbing DUDI
        Route::get('supervisor/journals', [SupervisorJournalController::class, 'index'])->name('supervisor.journals.index');
        Route::put('supervisor/journals/{journal}/validate', [SupervisorJournalController::class, 'validateJournal'])->name('supervisor.journals.validate');
        Route::get('industry/journals', fn () => redirect()->route('pkl.supervisor.journals.index'))->name('industry.journals.index');

        // Rekap Monitoring PKL (Admin & Koordinator)
        Route::get('monitoring', [PklMonitoringController::class, 'index'])->name('monitoring.index');
    });
});

require __DIR__.'/settings.php';
