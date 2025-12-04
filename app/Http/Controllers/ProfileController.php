<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        // PERBAIKAN: Menggunakan nama kolom yang benar (peran dan no_telepon).
        // PENTING: Menghapus 'password' dari data yang dikirim ke frontend.
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'auth' => [
                'user' => $request->user()->only('id_user', 'username', 'email', 'nama_lengkap', 'no_telepon', 'peran'), 
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Data yang telah divalidasi, termasuk: nama_lengkap, username, no_telepon, email, dan peran (jika Admin)
        $validated = $request->validated();
        
        // --- 1. Pembaruan Atribut Dasar ---

        // PERBAIKAN: Menggunakan nama kolom yang benar: 'no_telepon' dan 'peran'.
        // PENTING: Hapus pembaruan 'password' di sini, karena form ini hanya untuk profil.
        $user->fill([
            'nama_lengkap' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'no_telepon' => $validated['no_telepon'], // <-- Diperbaiki
            'email' => $validated['email'],
            // 'password' TIDAK diisi di sini
        ]);
        
        // --- 2. Logika Khusus Pembaruan Peran (Peran) untuk Admin ---
        // $request->user()->peran digunakan untuk memeriksa apakah user yang sedang login adalah Admin
        if ($request->user()->peran === 'Admin' && isset($validated['peran'])) {
            // Karena validasi sudah menjamin bahwa hanya Admin yang bisa mengirim field 'peran',
            // kita bisa langsung mengisi nilai peran yang baru jika field tersebut ada.

            // Perhatikan: $user di sini adalah user yang SANGAT SEDANG LOGIN.
            $user->peran = $validated['peran']; // <-- Diperbaiki
        }

        // --- 3. Logika Verifikasi Email ---
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}