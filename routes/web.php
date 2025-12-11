<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\IkuController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RkatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TahunAnggaranController;
use App\Http\Controllers\UnitController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

//Route::middleware(['auth', 'verified'])->group(function () {
//    Route::get('/dashboard', Inertia::render('Dashboard'))->name('dashboard');
//});
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // === ROUTE RKAT (Sudah Ada) ===
    Route::get('/rkat/input', [RkatController::class, 'create'])->name('rkat.create');
    Route::post('/rkat', [RkatController::class, 'store'])->name('rkat.store');

    Route::get('/iku/input', [IkuController::class, 'create'])->name('iku.create');
    Route::post('/iku', [IkuController::class, 'store'])->name('iku.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Unit resource routes
    Route::get('/unit', [UnitController::class, 'index'])->name('unit.index');
    Route::get('/unit/create', [UnitController::class, 'create'])->name('unit.create');
    Route::post('/unit', [UnitController::class, 'store'])->name('unit.store');
    Route::get('/unit/{unit}/edit', [UnitController::class, 'edit'])->name('unit.edit');
    Route::patch('/unit/{unit}', [UnitController::class, 'update'])->name('unit.update');
    Route::delete('/unit/{unit}', [UnitController::class, 'destroy'])->name('unit.destroy');

    // Admin-only routes: Tahun Anggaran and account creation
    Route::middleware(['admin'])->group(function () {
        // Tahun Anggaran management (index, create, store, edit, update, destroy)
        Route::get('/tahun', [TahunAnggaranController::class, 'index'])->name('tahun.index');
        Route::get('/tahun/create', [TahunAnggaranController::class, 'create'])->name('tahun.create');
        Route::post('/tahun', [TahunAnggaranController::class, 'store'])->name('tahun.store');
        Route::get('/tahun/{tahun}/edit', [TahunAnggaranController::class, 'edit'])->name('tahun.edit');
        Route::patch('/tahun/{tahun}', [TahunAnggaranController::class, 'update'])->name('tahun.update');
        Route::delete('/tahun/{tahun}', [TahunAnggaranController::class, 'destroy'])->name('tahun.destroy');

        // Note: registration routes have been moved to admin-only in routes/auth.php
    // Admin-only user creation
    Route::get('/user/create', [\App\Http\Controllers\Admin\UserController::class, 'create'])->name('user.create');
    Route::post('/user', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('user.store');
    // Admin-only user listing
    Route::get('/user', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('user.index');
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/approval', [ApprovalController::class, 'index'])->name('approval.index');
    Route::post('/approval/approve/{rkatHeader}', [ApprovalController::class, 'approve'])->name('approval.approve');
});

Route::get('/monitoring', [MonitoringController::class, 'index'])->middleware(['auth', 'verified'])->name('monitoring.index');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
