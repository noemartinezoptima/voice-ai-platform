<?php

namespace Tests\Unit\Domain\Knowledge\Services;

use App\Domain\Knowledge\Services\ChunkingService;
use App\Domain\Knowledge\Services\EmbeddingServiceInterface;
use App\Domain\Knowledge\Services\KnowledgeRetrievalService;
use App\Domain\Knowledge\Services\RetrievalType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class KnowledgeRetrievalServiceTest extends TestCase
{
    use RefreshDatabase;

    private KnowledgeRetrievalService $service;

    private EmbeddingServiceInterface $embeddings;

    private ChunkingService $chunking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->embeddings = $this->createMock(EmbeddingServiceInterface::class);
        $this->embeddings->method('embed')->willReturn([0.1, 0.2, 0.3]);
        $this->embeddings->method('embedMany')->willReturn([[0.1, 0.2, 0.3]]);

        $this->chunking = new ChunkingService;
        $this->service = new KnowledgeRetrievalService($this->embeddings, $this->chunking);
    }

    #[Test]
    public function retrieve_returns_semantic_result(): void
    {
        $retrievalResult = $this->service->retrieve('test-tenant', 'how do calls work', type: RetrievalType::Semantic);

        $this->assertSame(RetrievalType::Semantic, $retrievalResult->type);
        $this->assertEmpty($retrievalResult->chunks);
    }

    #[Test]
    public function retrieve_returns_summary_result(): void
    {
        $retrievalResult = $this->service->retrieve('test-tenant', 'summarize calls', type: RetrievalType::Summary);

        $this->assertSame(RetrievalType::Summary, $retrievalResult->type);
    }

    #[Test]
    public function cosine_similarity_returns_one_for_identical_vectors(): void
    {
        $ref = new \ReflectionMethod($this->service, 'cosineSimilarity');
        $ref->setAccessible(true);

        $result = $ref->invoke($this->service, [1.0, 0.0, 0.0], [1.0, 0.0, 0.0]);

        $this->assertEqualsWithDelta(1.0, $result, 0.0001);
    }

    #[Test]
    public function cosine_similarity_returns_zero_for_orthogonal_vectors(): void
    {
        $ref = new \ReflectionMethod($this->service, 'cosineSimilarity');
        $ref->setAccessible(true);

        $result = $ref->invoke($this->service, [1.0, 0.0], [0.0, 1.0]);

        $this->assertEqualsWithDelta(0.0, $result, 0.0001);
    }

    #[Test]
    public function cosine_similarity_returns_zero_for_zero_vector(): void
    {
        $ref = new \ReflectionMethod($this->service, 'cosineSimilarity');
        $ref->setAccessible(true);

        $result = $ref->invoke($this->service, [0.0, 0.0], [1.0, 0.0]);

        $this->assertEqualsWithDelta(0.0, $result, 0.0001);
    }
}
