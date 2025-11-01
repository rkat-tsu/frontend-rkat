<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RkatController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\IkuController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    // === ROUTE RKAT (Sudah Ada) ===
    Route::get('/rkat/input', [RkatController::class, 'create'])->name('rkat.create');
    Route::post('/rkat', [RkatController::class, 'store'])->name('rkat.store');
    
    // === ROUTE IKU BARU ===
    // Menampilkan form IKU/IKUSUB/IKK (Mengarah ke Iku/Create.jsx)
    Route::get('/iku/input', [IkuController::class, 'create'])->name('iku.create');
    // Menyimpan data IKU/IKUSUB/IKK
    Route::post('/iku', [IkuController::class, 'store'])->name('iku.store');
    // Tambahkan route index IKU jika diperlukan
    // Route::get('/iku', [IkuController::class, 'index'])->name('iku.index');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/approval', [ApprovalController::class, 'index'])->name('approver.index');
    Route::post('/approval/approve/{rkatHeader}', [ApprovalController::class, 'approve'])->name('approver.approve');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';