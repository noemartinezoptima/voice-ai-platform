<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ElevenLabsKeyInvalid extends Notification
{
    use Queueable;

    public function __construct(private readonly string $tenantName) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('ElevenLabs API key needs attention')
            ->greeting("Hi {$notifiable->name},")
            ->line("Your ElevenLabs API key for {$this->tenantName} is no longer valid.")
            ->line('Please reconnect in Settings > ElevenLabs to restore voice synthesis.')
            ->action('Reconnect', url('/settings/tenant'));
    }
}
