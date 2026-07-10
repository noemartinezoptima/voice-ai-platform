<?php

namespace App\Providers;

use App\Domain\Call\Repositories\CallRepositoryInterface;
use App\Domain\Flow\Repositories\FlowRepositoryInterface;
use App\Domain\Flow\Services\AiServiceInterface;
use App\Domain\Knowledge\Repositories\DocumentRepositoryInterface;
use App\Domain\Knowledge\Repositories\KnowledgeChunkRepositoryInterface;
use App\Domain\Knowledge\Services\ChunkingService;
use App\Domain\Knowledge\Services\EmbeddingServiceInterface;
use App\Domain\Knowledge\Services\KnowledgeRetrievalService;
use App\Domain\Tenant\Repositories\TenantRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Call\EloquentCallRepository;
use App\Infrastructure\Persistence\Eloquent\Flow\EloquentFlowRepository;
use App\Infrastructure\Persistence\Eloquent\Knowledge\EloquentChunkRepository;
use App\Infrastructure\Persistence\Eloquent\Knowledge\EloquentDocumentRepository;
use App\Infrastructure\Persistence\Eloquent\Tenant\EloquentTenantRepository;
use App\Infrastructure\Services\ElevenLabsAgentService;
use App\Infrastructure\Services\FakeAiService;
use App\Infrastructure\Services\Knowledge\OpenAIEmbeddingService;
use App\Infrastructure\Services\OpenAiService;
use App\Infrastructure\Services\TwilioAiService;
use App\Listeners\UserActivitySubscriber;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(TenantRepositoryInterface::class, EloquentTenantRepository::class);
        $this->app->bind(FlowRepositoryInterface::class, EloquentFlowRepository::class);
        $this->app->bind(CallRepositoryInterface::class, EloquentCallRepository::class);
        $this->app->bind(DocumentRepositoryInterface::class, EloquentDocumentRepository::class);
        $this->app->bind(KnowledgeChunkRepositoryInterface::class, EloquentChunkRepository::class);

        $this->app->bind(EmbeddingServiceInterface::class, function () {
            return new OpenAIEmbeddingService(
                apiKey: config('services.openai.api_key'),
            );
        });

        $this->app->singleton(ChunkingService::class);
        $this->app->singleton(KnowledgeRetrievalService::class);

        $this->app->bind(AiServiceInterface::class, function () {
            $assistantSid = config('twilio.ai_assistant_sid');

            if ($assistantSid !== null && $assistantSid !== '') {
                return new TwilioAiService(
                    accountSid: config('twilio.account_sid'),
                    authToken: config('twilio.auth_token'),
                    assistantSid: $assistantSid,
                );
            }

            $agentId = config('elevenlabs.agent_id');

            if ($agentId !== null && $agentId !== '') {
                return new ElevenLabsAgentService(
                    apiKey: config('elevenlabs.api_key'),
                    agentId: $agentId,
                );
            }

            $apiKey = config('services.openai.api_key');

            if ($apiKey !== null && $apiKey !== '') {
                return new OpenAiService(
                    apiKey: $apiKey,
                );
            }

            return new FakeAiService;
        });
    }

    public function boot(): void
    {
        Gate::define('viewAuditLog', fn (User $user) => $user->isOwnerOrAdmin());

        Event::subscribe(UserActivitySubscriber::class);

        Vite::prefetch(concurrency: 3);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('twilio', function (Request $request) {
            return Limit::perMinute(30)->by($request->input('From') ?: $request->ip());
        });

        RateLimiter::for('web', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
    }
}
