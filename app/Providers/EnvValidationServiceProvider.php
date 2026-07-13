<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use RuntimeException;

class EnvValidationServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $required = [
            'app.key' => 'APP_KEY',
            'database.default' => 'DB_CONNECTION',
            'twilio.account_sid' => 'TWILIO_ACCOUNT_SID',
            'twilio.auth_token' => 'TWILIO_AUTH_TOKEN',
        ];

        $optional = [
            'elevenlabs.api_key' => 'ELEVENLABS_API_KEY',
            'openai.api_key' => 'OPENAI_API_KEY',
        ];

        $missing = [];

        foreach ($required as $configKey => $envName) {
            if (empty(config($configKey))) {
                $missing[] = $envName;
            }
        }

        if ($missing !== [] && $this->app->isProduction()) {
            throw new RuntimeException(
                'Required environment variables missing: '.implode(', ', $missing).'. '.
                'Check your .env file or deployment configuration.'
            );
        }

        if ($missing !== []) {
            foreach ($missing as $var) {
                logger()->warning("Required environment variable [{$var}] is not set.");
            }
        }

        if ($this->app->isProduction()) {
            foreach ($optional as $configKey => $envName) {
                if (empty(config($configKey))) {
                    logger()->warning("Optional environment variable [{$envName}] is not set. Some features may be unavailable.");
                }
            }
        }
    }
}
