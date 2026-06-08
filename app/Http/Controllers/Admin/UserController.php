<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function create()
    {
        return inertia('Admin/User/Create', [
            'units' => Unit::orderBy('nama_unit', 'asc')->get(),
        ]);
    }

    public function index(Request $request)
    {
        Log::debug('[User Admin] Viewing Index', ['search' => $request->get('q'), 'unit' => $request->get('unit')]);

        $query = User::with('unit')->orderBy('nama_lengkap', 'asc');

        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('nama_lengkap', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('username', 'like', "%{$q}%")
                    ->orWhere('peran', 'like', "%{$q}%");
            });
        }

        if ($request->filled('unit')) {
            $unitId = $request->get('unit');
            $query->where('id_unit', $unitId);
        }

        $perPage = request()->get('per_page', 20);
        $perPage = $perPage === 'all' ? 10000 : (int) $perPage;

        $users = $query->paginate($perPage)->onEachSide(0)->withQueryString();

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            'filters' => $request->only(['q', 'unit', 'per_page']),
            'units' => Unit::orderBy('nama_unit', 'asc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Log::info('[User Admin] Admin creating new user', [
            'admin_id' => Auth::id(),
            'target_email' => $request->email,
            'target_role' => $request->peran
        ]);

        $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'nik' => 'nullable|string|max:30',
            'username' => ['nullable', 'string', 'max:50', Rule::unique(User::class)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'no_telepon' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'peran' => ['required', 'string', Rule::in([
                'Inputer',
                'Kaprodi',
                'Kepala_Unit',
                'Dekan',
                'Tim_Renbang',
                'WR_1',
                'WR_2',
                'WR_3',
                'Rektor',
                'Admin'
            ])],
            'id_unit' => ['nullable', 'exists:unit,id_unit'],
        ]);

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'nik' => $request->nik,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'peran' => $request->peran,
            'id_unit' => $request->id_unit ?? null,
            'is_aktif' => true,
        ]);

        try {
            event(new Registered($user));
        } catch (\Exception $e) {
            Log::error('[User Admin] Failed to send registration email: ' . $e->getMessage());
            return Redirect::route('user.index')->with('success', 'User berhasil dibuat, tetapi email verifikasi gagal dikirim karena masalah server email.');
        }
        
        Log::info('[User Admin] User created successfully', ['new_user_id' => $user->id_user]);

        return Redirect::route('user.index')->with('success', 'User berhasil dibuat.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/User/Edit', [
            'user' => $user,
            'units' => Unit::orderBy('nama_unit', 'asc')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'nik' => 'nullable|string|max:30',
            'username' => ['nullable', 'string', 'max:50', Rule::unique(User::class, 'username')->ignore($user->id_user, 'id_user')],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class, 'email')->ignore($user->id_user, 'id_user')],
            'no_telepon' => 'nullable|string|max:20',
            'peran' => ['required', 'string', Rule::in([
                'Inputer',
                'Kaprodi',
                'Kepala_Unit',
                'Dekan',
                'Tim_Renbang',
                'WR_1',
                'WR_2',
                'WR_3',
                'Rektor',
                'Admin'
            ])],
            'id_unit' => ['nullable', 'exists:unit,id_unit'],
            'is_aktif' => 'required|boolean',
        ]);

        $user->fill([
            'nama_lengkap' => $request->nama_lengkap,
            'nik' => $request->nik,
            'username' => $request->username,
            'email' => $request->email,
            'peran' => $request->peran,
            'id_unit' => $request->id_unit ?? null,
            'is_aktif' => $request->is_aktif,
            'no_telepon' => $request->no_telepon,
        ])->save();

        return Redirect::route('user.index')->with('success', 'Data user berhasil diperbarui.');
    }

    public function updatePassword(Request $request, User $user)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user->fill([
            'password' => Hash::make($request->password),
        ])->save();

        return Redirect::back()->with('success', 'Password user berhasil diganti paksa.');
    }

    public function destroy(User $user)
    {
        if ($user->id_user === Auth::id()) {
            return Redirect::back()->with('error', 'Anda tidak bisa menghapus akun Anda sendiri.');
        }

        User::destroy($user->id_user);

        return Redirect::route('user.index')->with('success', 'User berhasil dihapus.');
    }
}
