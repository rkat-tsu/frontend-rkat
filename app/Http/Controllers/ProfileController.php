<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
                'user' => $request->user()->only(['id_user', 'username', 'email', 'nama_lengkap', 'no_telepon', 'peran', 'signature_path']), 
            ],
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        Log::debug('[Profile] Permintaan Pembaruan oleh ' . $user->username, $request->validated());

        $validated = $request->validated();
        
        $user->fill([
            'nama_lengkap' => $validated['nama_lengkap'],
            'username' => $validated['username'],
            'no_telepon' => $validated['no_telepon'], 
            'email' => $validated['email'],
        ]);
        
        if ($request->user()->peran === 'Admin' && isset($validated['peran'])) {
            Log::info('[Profile] Admin mengubah peran menjadi: ' . $validated['peran']);
            $user->peran = $validated['peran']; 
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // Handle signature upload via file
        if ($request->hasFile('signature_file')) {
            if ($user->signature_path) {
                Storage::disk('public')->delete($user->signature_path);
            }
            $path = $request->file('signature_file')->store('signatures', 'public');
            $user->signature_path = $path;
            Log::info('[Profile] Signature file updated.');
        } 
        // Handle signature via base64 from canvas
        else if ($request->filled('signature_base64')) {
            if ($user->signature_path) {
                Storage::disk('public')->delete($user->signature_path);
            }
            
            $base64_str = substr($validated['signature_base64'], strpos($validated['signature_base64'], ",")+1);
            $image = base64_decode($base64_str);
            $filename = 'signatures/' . Str::random(40) . '.png';
            
            Storage::disk('public')->put($filename, $image);
            $user->signature_path = $filename;
            Log::info('[Profile] Signature base64 updated.');
        }

        $user->save();
        Log::info('[Profile] Profil Diperbarui.');

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Log::warning('[Profile] Permintaan Penghapusan Akun oleh ' . $request->user()->username);
        
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        User::query()->where('id_user', $user->id_user)->delete();
        Log::info('[Profile] Akun Dihapus.');

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}