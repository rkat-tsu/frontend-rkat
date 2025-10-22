<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyUserEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $verificationUrl;

    /**
     * @param string $verificationUrl URL verifikasi yang sudah di-signed
     */
    public function __construct(string $verificationUrl)
    {
        $this->verificationUrl = $verificationUrl;
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
            ],
        );
    }
}