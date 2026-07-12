<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ElevenLabsKeyInvalid extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly string $tenantName) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('ElevenLabs API key needs attention')
            ->greeting("Hi {$notifiable->name},")
            ->line("Your ElevenLabs API key for {$this->tenantName} is no longer valid.")
            ->line('Please reconnect in Settings > ElevenLabs to restore voice synthesis.')
            ->action('Reconnect', url('/settings/tenant'));
    }
}
