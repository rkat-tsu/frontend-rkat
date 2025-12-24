<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log; // Added Log
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'auth' => [
                'user' => $request->user()->only('id_user', 'username', 'email', 'nama_lengkap', 'no_telepon', 'peran'), 
            ],
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        Log::debug('[Profile] Update Request by ' . $user->username, $request->validated());

        $validated = $request->validated();
        
        $user->fill([
            'nama_lengkap' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'no_telepon' => $validated['no_telepon'], 
            'email' => $validated['email'],
        ]);
        
        if ($request->user()->peran === 'Admin' && isset($validated['peran'])) {
            Log::info('[Profile] Admin changing role to: ' . $validated['peran']);
            $user->peran = $validated['peran']; 
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();
        Log::info('[Profile] Profile Updated.');

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Log::warning('[Profile] Account Deletion Requested by ' . $request->user()->username);
        
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();
        Log::info('[Profile] Account Deleted.');

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}