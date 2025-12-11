<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function create()
    {
        $units = \App\Models\Unit::orderBy('nama_unit')->get();
        return inertia('Admin/User/Create', [
            'units' => $units,
        ]);
    }

    public function index(Request $request)
    {
        $query = User::with('unit')->orderBy('nama_lengkap');

        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function($sub) use ($q) {
                $sub->where('nama_lengkap', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('username', 'like', "%{$q}%")
                    ->orWhere('peran', 'like', "%{$q}%");
            });
        }

        $users = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'username' => ['nullable','string','max:50', Rule::unique(User::class)],
            'email' => ['required','string','email','max:255', Rule::unique(User::class)],
            'no_telepon' => 'nullable|string|max:20',
            'password' => ['required','confirmed', Rules\Password::defaults()],
            'peran' => ['required','string', Rule::in([
                'Inputer', 'Kaprodi', 'Kepala_Unit', 'Dekan', 'WR_1', 'WR_2', 'WR_3', 'Rektor', 'Admin'
            ])],
            'id_unit' => ['nullable','exists:unit,id_unit'],
        ]);

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'peran' => $request->peran,
            'id_unit' => $request->id_unit ?? null,
            'is_aktif' => true,
        ]);

        // Fire registered event so verification mail can be sent if configured
        event(new Registered($user));

        return Redirect::route('dashboard')->with('success', 'User berhasil dibuat.');
    }
}
