<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VoiceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'default_tts_provider' => ['required', 'string', 'in:elevenlabs,twilio'],
            'default_language' => ['required', 'string', 'in:en,es,fr,de,it,pt'],
            'elevenlabs_voice_id' => ['nullable', 'string', 'max:100'],
            'tts_speed' => ['required', 'numeric', 'min:0.5', 'max:2.0'],
            'voice_stability' => ['required', 'numeric', 'min:0', 'max:1'],
            'voice_similarity_boost' => ['required', 'numeric', 'min:0', 'max:1'],
        ];
    }
}
