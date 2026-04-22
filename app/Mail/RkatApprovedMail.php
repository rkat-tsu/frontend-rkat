<?php

namespace App\Mail;

use App\Models\RkatHeader;
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

    /**
     * Create a new message instance.
     * 
     * @param RkatHeader $header
     * @param string $approver
     * @param string|null $judulKegiatan
     */
    public function __construct(RkatHeader $header, $approver, $judulKegiatan = null)
    {
        $this->rkatHeader = $header;
        $this->approverName = $approver;
        $this->judulKegiatan = $judulKegiatan;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Persetujuan RKAT: ' . ($this->judulKegiatan ?? $this->rkatHeader->nomor_dokumen ?? 'RKAT'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rkat-approved',
            with: [
                'judul' => $this->judulKegiatan ?? $this->rkatHeader->nomor_dokumen ?? 'RKAT',
                'unit' => $this->rkatHeader->unit->nama_unit ?? 'N/A',
                'approver' => $this->approverName,
                'headerId' => $this->rkatHeader->id_header,
            ],
        );
    }
}