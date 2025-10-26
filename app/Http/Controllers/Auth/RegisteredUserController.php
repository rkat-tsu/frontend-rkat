<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:100', // max:100 sesuai skema
            'username' => 'nullable|string|max:50|unique:'.User::class, // Opsional, sesuai skema DB
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'no_telepon' => 'nullable|string|max:15', // Opsional, sesuai skema DB
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            
            'peran' => ['required','string', Rule::in([
                'Inputer', 
                'Kaprodi', 
                'Kepala_Unit', // Diperbarui dari 'Kepala_Biro'
                'Dekan', 
                'WR_1', 'WR_2', 'WR_3', 
                'Rektor', 
                'Admin'
            ])],
            
            // id_unit tidak divadlidasi di sini, karena biasanya diisi oleh Admin/belakangan
        ]);

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'peran' => $request->peran,
            
            // PERBAIKAN: Menggunakan 'id_unit' (sesuai skema) dan diset null
            'id_unit' => null, 
            
            'is_aktif' => true,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}