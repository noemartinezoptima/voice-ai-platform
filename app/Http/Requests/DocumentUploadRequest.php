<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocumentUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:102400'],
            'resource_type' => ['required', 'string', 'in:pdf,image,csv,text'],
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
