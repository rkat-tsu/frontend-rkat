<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RkatApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $rkatHeader;
    public $approverName;

    public function __construct($header, $approver)
    {
        $this->rkatHeader = $header;
        $this->approverName = $approver;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Persetujuan RKAT: ' . $this->rkatHeader->judul_pengajuan,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rkat-approved', // Pastikan view ini ada
            with: [
                'judul' => $this->rkatHeader->judul_pengajuan,
                'departemen' => $this->rkatHeader->departemen->nama_departemen ?? 'N/A',
                'approver' => $this->approverName,
                'headerId' => $this->rkatHeader->id_header,
            ],
        );
    }
}