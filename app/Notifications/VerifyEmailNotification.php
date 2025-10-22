<?php

// app/Notifications/VerifyEmailNotification.php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use App\Mail\VerifyUserEmail; // Mailable kustom
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends VerifyEmail
{
    // Method ini menangani pengiriman email, kita timpa untuk menggunakan Mailable kustom
    public function toMail($notifiable): VerifyUserEmail
    {
        // URL verifikasi yang ditandatangani oleh Laravel
        $verificationUrl = $this->verificationUrl($notifiable);
        
        return (new VerifyUserEmail($verificationUrl))
                    ->to($notifiable->email);
    }

    // Method untuk menghasilkan URL verifikasi (diwarisi dari parent)
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
}