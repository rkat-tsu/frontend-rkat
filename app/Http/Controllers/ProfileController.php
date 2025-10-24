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
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'auth' => [
                'user' => $request->user()->only('id', 'username', 'email', 'nama_lengkap', 'no_telp', 'peran', 'password'),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Data yang telah divalidasi, termasuk: nama_lengkap, username, no_telp, email, dan peran (jika Admin)
        $validated = $request->validated();

        // --- 1. Pembaruan Atribut Dasar (nama_lengkap, username, no_telp, email) ---
        // Semua field yang ada di $validated akan diisi ke model $user.
        // Karena validasi sudah memastikan username, no_telp, dan email diizinkan untuk diubah,
        // kita bisa menggunakan fill() secara langsung.
        $user->fill([
            'nama_lengkap' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'no_telp' => $validated['no_telp'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        // --- 2. Logika Verifikasi Email ---
        // Hanya atur ulang verifikasi jika email benar-benar diubah.
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // --- 3. Logika Khusus Pembaruan Peran (Role) untuk Admin ---
        // Hanya Admin yang dapat mengubah field 'peran'.
        if ($user->peran === 'Admin' && isset($validated['peran'])) {
            // Karena validasi di ProfileUpdateRequest menggunakan 'prohibited' untuk non-Admin,
            // kita hanya perlu cek apakah field 'peran' ada di data yang divalidasi.

            // Catatan: Dalam konteks ini, $user adalah user yang SANGAT SEDANG LOGIN.
            // Jika Admin ingin mengubah peran pengguna LAIN, ini harus diubah ke controller lain (misal: UserController@updateRole),
            // tetapi untuk pembaruan profil pengguna yang sedang login, ini benar.

            // Jika Admin mengubah perannya sendiri:
            $user->peran = $validated['peran'];
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
