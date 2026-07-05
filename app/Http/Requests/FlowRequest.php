<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FlowRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:2000'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'config' => ['nullable', 'json'],
            'template_id' => ['nullable', 'string', 'max:50'],
        ];
    }
}
