<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\PencairanDanaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IkuController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RincianAnggaranController;
use App\Http\Controllers\RkatController;
use App\Http\Controllers\RkatRabItemController;
use App\Http\Controllers\TahunAnggaranController;
use App\Http\Controllers\UnitController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login');
});



Route::middleware(['auth', 'verified'])->group(function () {
    // dashboard route
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // === ROUTE DAFTAR AJUAN (RKA Headers) ===
    Route::get('/daftar-ajuan/input', [RkatController::class, 'create'])->name('daftar-ajuan.create');
    Route::post('/daftar-ajuan', [RkatController::class, 'store'])->name('daftar-ajuan.store');
    Route::get('/daftar-ajuan', [RkatController::class, 'index'])->name('daftar-ajuan.index');
    Route::get('/daftar-ajuan/{rkatHeader}', [RkatController::class, 'show'])->name('daftar-ajuan.show');
    Route::get('/daftar-ajuan/{rkatHeader}/edit', [RkatController::class, 'edit'])->name('daftar-ajuan.edit');
    Route::patch('/daftar-ajuan/{rkatHeader}', [RkatController::class, 'update'])->name('daftar-ajuan.update');
    Route::post('/daftar-ajuan/{rkatHeader}/submit', [RkatController::class, 'submit'])->name('daftar-ajuan.submit');
    Route::get('/daftar-ajuan/{rkatHeader}/export', [RkatController::class, 'exportPdf'])->name('daftar-ajuan.export');

    // Unit resource routes (Public view)
    Route::get('/unit', [UnitController::class, 'index'])->name('unit.index');

    // Master IKU
    Route::get('/iku', [IkuController::class, 'index'])->name('iku.index');

    // Standar Biaya Operasional (Public view)
    Route::get('/rincian-anggaran', [RincianAnggaranController::class, 'index'])->name('rincian.index');

    // Routes for RKAT (RAB items)
    Route::get('/rkat', [RkatRabItemController::class, 'index'])->name('rkat.index');
    Route::get('/rkat/create', [RkatRabItemController::class, 'create'])->name('rkat.create');
    Route::post('/rkat', [RkatRabItemController::class, 'store'])->name('rkat.store');

    // === ROUTE APPROVAL ===
    Route::middleware(['approver'])->group(function () {
        Route::get('/approval', [ApprovalController::class, 'index'])->name('approval.index');
        Route::post('/approval/approve/{rkatHeader}', [ApprovalController::class, 'approve'])->name('approval.process');
    });

    // monitoring route
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');

    // Pencairan Dana
    Route::get('/pencairan', [PencairanDanaController::class, 'index'])->name('pencairan.index');
    Route::get('/pencairan/create', [PencairanDanaController::class, 'create'])->name('pencairan.create');
    Route::post('/pencairan', [PencairanDanaController::class, 'store'])->name('pencairan.store');
    Route::get('/pencairan/approval', [PencairanDanaController::class, 'approvalIndex'])->name('pencairan.approval');
    Route::get('/pencairan/{pencairan}', [PencairanDanaController::class, 'show'])->name('pencairan.show');
    Route::post('/pencairan/{pencairan}/submit', [PencairanDanaController::class, 'submit'])->name('pencairan.submit');
    Route::post('/pencairan/{pencairan}/approve', [PencairanDanaController::class, 'approve'])->name('pencairan.approve');
    Route::get('/pencairan/{pencairan}/export', [PencairanDanaController::class, 'exportPdf'])->name('pencairan.export');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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
        Route::get('/rincian-anggaran/create', [RincianAnggaranController::class, 'create'])->name('rincian.create');
        Route::post('/rincian-anggaran', [RincianAnggaranController::class, 'store'])->name('rincian.store');
        Route::get('/rincian-anggaran/{rincian}/edit', [RincianAnggaranController::class, 'edit'])->name('rincian.edit');
        Route::patch('/rincian-anggaran/{rincian}', [RincianAnggaranController::class, 'update'])->name('rincian.update');
        Route::delete('/rincian-anggaran/{rincian}', [RincianAnggaranController::class, 'destroy'])->name('rincian.destroy');

        // Admin-only user management
        Route::get('/user', [UserController::class, 'index'])->name('user.index');
        Route::get('/user/create', [UserController::class, 'create'])->name('user.create');
        Route::post('/user', [UserController::class, 'store'])->name('user.store');
        Route::get('/user/{user}/edit', [UserController::class, 'edit'])->name('user.edit');
        Route::patch('/user/{user}', [UserController::class, 'update'])->name('user.update');
        Route::delete('/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');
        Route::patch('/user/{user}/password', [UserController::class, 'updatePassword'])->name('user.password.update');

        // Unit management
        Route::get('/unit/create', [UnitController::class, 'create'])->name('unit.create');
        Route::post('/unit', [UnitController::class, 'store'])->name('unit.store');
        Route::get('/unit/{unit}/edit', [UnitController::class, 'edit'])->name('unit.edit');
        Route::patch('/unit/{unit}', [UnitController::class, 'update'])->name('unit.update');
        Route::delete('/unit/{unit}', [UnitController::class, 'destroy'])->name('unit.destroy');

        // Master IKU
        Route::post('/iku/master', [IkuController::class, 'storeMaster'])->name('iku.master.store');
        Route::delete('/iku/{iku}', [IkuController::class, 'destroy'])->name('iku.destroy');

        // IKK Management
        Route::get('/iku/input-ikk', [IkuController::class, 'create'])->name('iku.create');
        Route::post('/iku/sync-ikk', [IkuController::class, 'store'])->name('iku.store');
    });
});

require __DIR__ . '/auth.php';
