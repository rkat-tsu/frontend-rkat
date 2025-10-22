<?php

// app/Notifications/ResetPasswordNotification.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Mail\UserResetPasswordMail; // Mailable kustom yang dibuat sebelumnya

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;
    public $user; // Menyimpan model pengguna

    public function __construct($token, $user)
    {
        $this->token = $token;
        $this->user = $user;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): UserResetPasswordMail
    {
        // Mengembalikan Mailable kustom Anda
        return (new UserResetPasswordMail($this->token, $this->user))
                    ->to($notifiable->email);
    }
}