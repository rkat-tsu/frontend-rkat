<?php

namespace App\Mail;

use App\Models\User as UserModel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyUserEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $verificationUrl;
    public $user;

    /**
     * @param string $verificationUrl URL verifikasi yang sudah di-signed
     * @param \App\Models\User $user Model pengguna yang akan diverifikasi
     */
    public function __construct(string $verificationUrl, UserModel $user)
    {
        $this->verificationUrl = $verificationUrl;
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verifikasi Alamat Email Anda',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.auth.verify-email', // View custom Anda
            with: [
                'verificationUrl' => $this->verificationUrl,
                'name' => $this->user->nama_lengkap,
            ],
        );
    }
}