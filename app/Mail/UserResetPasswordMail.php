<?php

namespace App\Mail;

use App\Models\User as UserModel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $user;

    /**
     * @param string $token Token reset password
     * @param \App\Models\User $user Model pengguna yang meminta reset
     */
    public function __construct(string $token, UserModel $user)
    {
        $this->token = $token;
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Permintaan Reset Password Akun Anda',
        );
    }

    public function content(): Content
    {
        // URL untuk reset password harus sesuai dengan route di Laravel Anda
        $resetUrl = url(route('password.reset', [
            'token' => $this->token,
            'email' => $this->user->email // Asumsi kolom email ada
        ], false));

        return new Content(
            markdown: 'emails.auth.password-reset', // View custom Anda
            with: [
                'resetUrl' => $resetUrl,
                'name' => $this->user->nama_lengkap,
            ],
        );
    }
}