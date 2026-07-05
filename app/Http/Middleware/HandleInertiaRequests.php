<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $locale = App::getLocale();
        $translations = $this->loadTranslations($locale);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => $request->session()->get('message'),
                'token' => $request->session()->get('token'),
                'success' => $request->session()->get('success'),
            ],
            'locale' => $locale,
            'translations' => $translations,
        ];
    }

    /** @return array<string, array<string, string>> */
    private function loadTranslations(string $locale): array
    {
        $namespaces = ['common', 'navigation', 'dashboard', 'flows', 'calls', 'settings', 'team', 'api-tokens', 'auth'];

        $translations = [];
        foreach ($namespaces as $ns) {
            $path = lang_path("{$locale}/{$ns}.php");
            if (file_exists($path)) {
                $translations[$ns] = require $path;
            }
        }

        return $translations;
    }
}
