<?php

namespace App\Mail;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComplianceDigest extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array{total_calls: int, total_recordings: int, retention_days: int, expiring_soon: int}  $stats
     */
    public function __construct(
        public TenantModel $tenant,
        public array $stats,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Weekly Compliance Summary — '.$this->tenant->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.compliance-digest',
        );
    }
}
