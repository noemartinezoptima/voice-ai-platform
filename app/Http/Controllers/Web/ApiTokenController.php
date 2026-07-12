<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApiTokenRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ApiTokenController extends Controller
{
    public function index(Request $request): Response
    {
        $tokens = $request->user()->tokens()->orderBy('created_at', 'desc')->get()->map(fn ($t) => [
            'id' => $t->id,
            'name' => $t->name,
            'abilities' => $t->abilities,
            'last_used_at' => $t->last_used_at?->diffForHumans(),
            'created_at' => $t->created_at->toDateTimeString(),
            'expires_at' => $t->expires_at?->toDateTimeString(),
        ]);

        return Inertia::render('ApiTokens/Index', [
            'tokens' => $tokens,
        ]);
    }

    public function store(ApiTokenRequest $request): RedirectResponse
    {
        $abilities = $request->abilities
            ? array_map('trim', explode(',', $request->abilities))
            : ['*'];

        $expiresAt = match ($request->expires_in) {
            '30' => Carbon::now()->addDays(30),
            '90' => Carbon::now()->addDays(90),
            '365' => Carbon::now()->addYear(),
            default => null,
        };

        $token = $request->user()->createToken(
            $request->name,
            $abilities,
            $expiresAt,
        );

        activity('security')
            ->causedBy($request->user())
            ->event('api_token_created')
            ->log(":causer.name creó el token «{$request->name}»");

        return redirect()->route('api-tokens.index')
            ->with('token', $token->plainTextToken);
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $token = $request->user()->tokens()->where('id', $id)->first();

        if ($token) {
            $name = $token->name;
            $token->delete();
        } else {
            $name = 'unknown';
        }

        activity('security')
            ->causedBy($request->user())
            ->event('api_token_revoked')
            ->log(":causer.name revocó el token «{$name}»");

        return redirect()->route('api-tokens.index')
            ->with('success', 'Token revoked.');
    }
}
