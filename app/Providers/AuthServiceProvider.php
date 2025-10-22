<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Notifications\VerifyEmail;
use App\Notifications\VerifyEmailNotification; // Notifikasi kustom Anda

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // 1. Daftarkan Policies (jika ada)
        $this->registerPolicies();

        // 2. Integrasi Verifikasi Email Kustom
        VerifyEmail::toMailUsing(function ($notifiable, $verificationUrl) {
            return (new VerifyEmailNotification($verificationUrl))
                ->to($notifiable->email);
        });
    }
}