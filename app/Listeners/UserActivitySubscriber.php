<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Request;

class UserActivitySubscriber
{
    public function handleLogin(Login $event): void
    {
        /** @var User|null $user */
        $user = $event->user;

        if ($user) {
            activity('security')
                ->causedBy($user)
                ->event('login')
                ->log(':causer.name inició sesión');
        }
    }

    public function handleFailed(Failed $event): void
    {
        activity('security')
            ->event('login_failed')
            ->withProperties([
                'ip' => Request::ip(),
                'email' => $event->credentials['email'] ?? 'unknown',
            ])
            ->log('Intento fallido para '.($event->credentials['email'] ?? 'unknown').' desde '.Request::ip());
    }

    public function handleLogout(Logout $event): void
    {
        /** @var User|null $user */
        $user = $event->user;

        activity('security')
            ->causedBy($user)
            ->event('logout')
            ->log(':causer.name cerró sesión');
    }

    /** @return array<class-string, string> */
    public function subscribe(): array
    {
        return [
            Login::class => 'handleLogin',
            Failed::class => 'handleFailed',
            Logout::class => 'handleLogout',
        ];
    }
}
