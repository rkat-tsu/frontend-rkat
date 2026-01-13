<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        Log::debug('[Register] Permintaan Pendaftaran Baru', $request->except(['password', 'password_confirmation']));

        $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'username' => 'nullable|string|max:50|unique:'.User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'no_telepon' => 'nullable|string|max:15',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'peran' => ['required','string', Rule::in([
                'Inputer', 'Kaprodi', 'Kepala_Unit', 'Dekan', 'WR_1', 'WR_2', 'WR_3', 'Rektor', 'Admin'
            ])],
        ]);

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'peran' => $request->peran,
            'id_unit' => null, 
            'is_aktif' => true,
        ]);

        Log::info('[Register] User Berhasil Dibuat', ['id_user' => $user->id_user, 'email' => $user->email]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}