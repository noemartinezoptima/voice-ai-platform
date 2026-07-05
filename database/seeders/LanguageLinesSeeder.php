<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\TranslationLoader\LanguageLine;

class LanguageLinesSeeder extends Seeder
{
    public function run(): void
    {
        LanguageLine::firstOrCreate(
            ['group' => 'dashboard', 'key' => 'welcome'],
            ['text' => [
                'en' => 'Welcome to ZeroVoice, :name!',
                'es' => '¡Bienvenido a ZeroVoice, :name!',
            ]]
        );

        LanguageLine::firstOrCreate(
            ['group' => 'common', 'key' => 'copied'],
            ['text' => [
                'en' => 'Copied to clipboard!',
                'es' => '¡Copiado al portapapeles!',
            ]]
        );

        LanguageLine::firstOrCreate(
            ['group' => 'team', 'key' => 'invite_sent'],
            ['text' => [
                'en' => 'Invitation on its way!',
                'es' => '¡Invitación en camino!',
            ]]
        );
    }
}
