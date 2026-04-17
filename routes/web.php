<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IkuController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RincianAnggaranController;
use App\Http\Controllers\RkatController;
use App\Http\Controllers\RkatRabItemController;
use App\Http\Controllers\TahunAnggaranController;
use App\Http\Controllers\UnitController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        //'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route::middleware(['auth', 'verified'])->group(function () {
//    Route::get('/dashboard', Inertia::render('Dashboard'))->name('dashboard');
// });

Route::middleware(['auth', 'verified'])->group(function () {
    // dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // === ROUTE RKAT ===
    Route::get('/rkat/input', [RkatController::class, 'create'])->name('rkat.create');
    Route::post('/rkat', [RkatController::class, 'store'])->name('rkat.store');
    Route::get('/rkat', [RkatController::class, 'index'])->name('rkat.index');
    Route::get('/rkat/{id}', [RkatController::class, 'show'])->name('rkat.show');
    // Tambahkan di bawah route rkat lainnya
    Route::post('/rkat/{id}/submit', [RkatController::class, 'submit'])->name('rkat.submit');

    // Unit resource routes
    Route::get('/unit', [UnitController::class, 'index'])->name('unit.index');
    Route::get('/unit/create', [UnitController::class, 'create'])->name('unit.create');
    Route::post('/unit', [UnitController::class, 'store'])->name('unit.store');
    Route::get('/unit/{unit}/edit', [UnitController::class, 'edit'])->name('unit.edit');
    Route::patch('/unit/{unit}', [UnitController::class, 'update'])->name('unit.update');
    Route::delete('/unit/{unit}', [UnitController::class, 'destroy'])->name('unit.destroy');

    // Master IKU
    Route::get('/iku', [IkuController::class, 'index'])->name('iku.index');

    // Routes for Rkat RAB items (basic index & create)
    Route::get('/daftar-ajuan', [RkatRabItemController::class, 'index'])->name('daftar-ajuan.index');
    Route::get('/daftar-ajuan/create', [RkatRabItemController::class, 'create'])->name('daftar-ajuan.create');
    Route::post('/daftar-ajuan', [RkatRabItemController::class, 'store'])->name('daftar-ajuan.store');

    //approval routes
    Route::get('/approval', [ApprovalController::class, 'index'])->name('approval.index');
    Route::post('/approval/approve/{rkatHeader}', [ApprovalController::class, 'approve'])->name('approval.approve');

    //monitoring route
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');

    // Admin-only routes: Tahun Anggaran and account creation
    Route::middleware(['admin'])->group(function () {
        // Tahun Anggaran management (index, create, store, edit, update, destroy)
        Route::get('/tahun', [TahunAnggaranController::class, 'index'])->name('tahun.index');
        Route::get('/tahun/create', [TahunAnggaranController::class, 'create'])->name('tahun.create');
        Route::post('/tahun', [TahunAnggaranController::class, 'store'])->name('tahun.store');
        Route::get('/tahun/{tahun}/edit', [TahunAnggaranController::class, 'edit'])->name('tahun.edit');
        Route::patch('/tahun/{tahun}', [TahunAnggaranController::class, 'update'])->name('tahun.update');
        Route::delete('/tahun/{tahun}', [TahunAnggaranController::class, 'destroy'])->name('tahun.destroy');

        // Rincian Anggaran (master akun anggaran)
        Route::get('/rincian-anggaran', [RincianAnggaranController::class, 'index'])->name('rincian.index');
        Route::get('/rincian-anggaran/create', [RincianAnggaranController::class, 'create'])->name('rincian.create');
        Route::post('/rincian-anggaran', [RincianAnggaranController::class, 'store'])->name('rincian.store');
        Route::get('/rincian-anggaran/{rincian}/edit', [RincianAnggaranController::class, 'edit'])->name('rincian.edit');
        Route::patch('/rincian-anggaran/{rincian}', [RincianAnggaranController::class, 'update'])->name('rincian.update');
        Route::delete('/rincian-anggaran/{rincian}', [RincianAnggaranController::class, 'destroy'])->name('rincian.destroy');

        // Admin-only user creation
        Route::get('/user/create', [UserController::class, 'create'])->name('user.create');
        Route::post('/user', [UserController::class, 'store'])->name('user.store');
        // Admin-only user listing
        Route::get('/user', [UserController::class, 'index'])->name('user.index');

        // Master IKU
        Route::post('/iku/master', [IkuController::class, 'storeMaster'])->name('iku.master.store');
        Route::delete('/iku/{iku}', [IkuController::class, 'destroy'])->name('iku.destroy');

        // IKK Management
        Route::get('/iku/input-ikk', [IkuController::class, 'create'])->name('iku.create');
        Route::post('/iku/sync-ikk', [IkuController::class, 'store'])->name('iku.store');

        Route::middleware(['approver','admin'])->group(function () {
            // Routes untuk approver (Dekan, Kepala Unit, WR, Rektor)
            Route::get('/approval', [ApprovalController::class, 'index'])->name('approval.index');
            Route::post('/approval/approve/{rkatHeader}', [ApprovalController::class, 'approve'])->name('approval.process');
        });
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
