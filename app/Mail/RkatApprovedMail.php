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

    public $judulKegiatan;

    public function __construct($header, $approver, $judulKegiatan)
    {
        $this->rkatHeader = $header;
        $this->approverName = $approver;
        $this->judulKegiatan = $judulKegiatan;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Persetujuan RKAT: ' . ($this->judulKegiatan ?? 'RKAT'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rkat-approved', // Pastikan view ini ada
            with: [
                'judul' => $this->judulKegiatan ?? ($this->rkatHeader->id_header ?? 'RKAT'),
                'unit' => $this->rkatHeader->unit->nama_unit ?? 'N/A',
                'approver' => $this->approverName,
                'headerId' => $this->rkatHeader->id_header,
            ],
        );
    }
}