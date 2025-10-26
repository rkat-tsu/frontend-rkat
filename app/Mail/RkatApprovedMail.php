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

    public function __construct($header, $approver, $programKerja)
    {
        $this->rkatHeader = $header;
        $this->approverName = $approver;
        $this->programKerja = $programKerja;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Persetujuan RKAT: ' . $this->programKerja->nama_proker,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rkat-approved', // Pastikan view ini ada
            with: [
                'judul' => $this->programKerja->nama_proker,
                'unit' => $this->rkatHeader->unit->nama_unit ?? 'N/A',
                'approver' => $this->approverName,
                'headerId' => $this->rkatHeader->id_header,
            ],
        );
    }
}