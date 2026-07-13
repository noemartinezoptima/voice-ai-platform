<?php

namespace App\Services;

use App\Infrastructure\Persistence\Eloquent\Tenant\TenantModel;
use Illuminate\Support\Facades\Http;

class TwilioPhoneService
{
    public function __construct(
        private readonly string $accountSid,
        private readonly string $authToken,
    ) {}

    public static function forTenant(TenantModel $tenant): self
    {
        $sid = $tenant->settings['twilio_account_sid']
            ?? config('twilio.account_sid')
            ?? '';
        $token = $tenant->settings['twilio_auth_token']
            ?? config('twilio.auth_token')
            ?? '';

        return new self((string) $sid, (string) $token);
    }

    /** @param  array<string, mixed>  $options
     *  @return array<int, array<string, mixed>> */
    public function searchAvailable(string $country = 'US', array $options = []): array
    {
        $response = Http::withBasicAuth($this->accountSid, $this->authToken)
            ->get("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/AvailablePhoneNumbers/{$country}/Local.json", $options);

        return $response->json()['available_phone_numbers'] ?? [];
    }

    /** @return array<string, mixed> */
    public function buy(string $phoneNumber): array
    {
        $response = Http::withBasicAuth($this->accountSid, $this->authToken)
            ->asForm()
            ->post("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/IncomingPhoneNumbers.json", [
                'PhoneNumber' => $phoneNumber,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException($response->json()['message'] ?? 'Failed to buy number');
        }

        return $response->json();
    }

    /** @return array<int, array<string, mixed>> */
    public function listOwned(): array
    {
        $response = Http::withBasicAuth($this->accountSid, $this->authToken)
            ->get("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/IncomingPhoneNumbers.json", [
                'PageSize' => 50,
            ]);

        return $response->json()['incoming_phone_numbers'] ?? [];
    }

    public function release(string $sid): void
    {
        Http::withBasicAuth($this->accountSid, $this->authToken)
            ->delete("https://api.twilio.com/2010-04-01/Accounts/{$this->accountSid}/IncomingPhoneNumbers/{$sid}.json");
    }

    public function hasCredentials(): bool
    {
        return $this->accountSid !== '' && $this->authToken !== '';
    }
}
