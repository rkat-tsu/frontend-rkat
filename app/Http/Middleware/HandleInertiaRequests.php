<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $canApprovePencairan = false;
        
        if ($user) {
            $user->loadMissing('unit');
            $canApprovePencairan = $user->peran === 'Admin' || 
                $user->peran === 'WR_2' || 
                ($user->unit && $user->isUnitHead() && (
                    stripos($user->unit->nama_unit, 'BAAK') !== false ||
                    stripos($user->unit->nama_unit, 'BAUK') !== false ||
                    $user->unit->children()->exists()
                ));
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? array_merge($user->toArray(), [
                    'can_approve_pencairan' => $canApprovePencairan
                ]) : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
