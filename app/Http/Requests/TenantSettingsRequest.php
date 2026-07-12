<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('tenants', 'slug')->ignore($this->user()->tenant_id)],
            'timezone' => ['nullable', 'string', 'max:50'],
            'default_language' => ['nullable', 'string', 'max:10'],
            'twilio_account_sid' => ['nullable', 'string', 'max:255'],
            'twilio_auth_token' => ['nullable', 'string', 'max:255'],
            'twilio_phone_number' => ['nullable', 'string', 'max:20'],
            'whatsapp_phone_number' => ['nullable', 'string', 'max:20'],
            'elevenlabs_api_key' => ['nullable', 'string', 'max:255'],
            'elevenlabs_default_voice_id' => ['nullable', 'string', 'max:100'],
        ];
    }
}
