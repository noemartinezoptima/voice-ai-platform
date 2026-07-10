<?php

namespace Tests\Feature\Jobs;

use App\Domain\Knowledge\Entities\Document;
use App\Domain\Knowledge\Entities\KnowledgeChunk;
use App\Domain\Knowledge\Repositories\DocumentRepositoryInterface;
use App\Domain\Knowledge\Repositories\KnowledgeChunkRepositoryInterface;
use App\Domain\Knowledge\Services\ChunkingService;
use App\Domain\Knowledge\Services\EmbeddingServiceInterface;
use App\Domain\Knowledge\ValueObjects\ResourceType;
use App\Jobs\ProcessDocumentJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcessDocumentJobTest extends TestCase
{
    use RefreshDatabase;

    private DocumentRepositoryInterface $documents;

    private KnowledgeChunkRepositoryInterface $chunks;

    private EmbeddingServiceInterface $embeddings;

    private ChunkingService $chunking;

    private Document $document;

    private string $filePath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->chunking = new ChunkingService;
        $this->embeddings = $this->createMock(EmbeddingServiceInterface::class);
        $this->documents = $this->createMock(DocumentRepositoryInterface::class);
        $this->chunks = $this->createMock(KnowledgeChunkRepositoryInterface::class);

        $this->filePath = 'documents/test-content.txt';
        $fullPath = storage_path('app/'.$this->filePath);
        $dir = dirname($fullPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents($fullPath, 'Hello world. This is test content for document processing.');

        $this->document = new Document(
            id: 'test-doc-1',
            tenantId: 'tenant-1',
            name: 'test.txt',
            resourceType: ResourceType::Text,
            mimeType: 'text/plain',
            path: $this->filePath,
        );
    }

    public function test_processes_text_document(): void
    {
        $this->documents->method('findById')->willReturn($this->document);
        $this->embeddings->method('embedMany')->willReturn([[0.1, 0.2, 0.3]]);

        $this->documents->expects($this->exactly(2))
            ->method('save');

        $this->chunks->expects($this->once())
            ->method('saveMany')
            ->with($this->callback(function (array $chunks) {
                return count($chunks) > 0 && $chunks[0] instanceof KnowledgeChunk;
            }));

        $job = new ProcessDocumentJob('test-doc-1');
        $job->handle($this->documents, $this->chunks, $this->embeddings, $this->chunking);
    }

    public function test_skips_when_document_not_found(): void
    {
        $this->documents->method('findById')->willReturn(null);

        $this->documents->expects($this->never())->method('save');
        $this->chunks->expects($this->never())->method('saveMany');
        $this->chunks->expects($this->never())->method('deleteByDocument');

        $job = new ProcessDocumentJob('non-existent');
        $job->handle($this->documents, $this->chunks, $this->embeddings, $this->chunking);
    }

    public function test_marks_failed_on_exception(): void
    {
        $this->documents->method('findById')->willReturn($this->document);
        $chunking = $this->createMock(ChunkingService::class);
        $chunking->method('chunk')->willThrowException(new \RuntimeException('Processing error'));

        $this->documents->expects($this->exactly(2))
            ->method('save');

        $job = new ProcessDocumentJob('test-doc-1');
        $job->handle($this->documents, $this->chunks, $this->embeddings, $chunking);
    }

    public function test_marks_failed_for_unsupported_mime_type(): void
    {
        $doc = new Document(
            id: 'test-doc-2',
            tenantId: 'tenant-1',
            name: 'test.xyz',
            resourceType: ResourceType::Text,
            mimeType: 'application/octet-stream',
            path: $this->filePath,
        );

        $this->documents->method('findById')->willReturn($doc);
        $this->chunks->expects($this->never())->method('saveMany');

        $job = new ProcessDocumentJob('test-doc-2');
        $job->handle($this->documents, $this->chunks, $this->embeddings, $this->chunking);
    }

    public function test_marks_failed_when_file_missing(): void
    {
        $doc = new Document(
            id: 'test-doc-3',
            tenantId: 'tenant-1',
            name: 'empty.txt',
            resourceType: ResourceType::Text,
            mimeType: 'text/plain',
            path: 'documents/non-existent.txt',
        );

        $this->documents->method('findById')->willReturn($doc);
        $this->chunks->expects($this->never())->method('saveMany');

        $job = new ProcessDocumentJob('test-doc-3');
        $job->handle($this->documents, $this->chunks, $this->embeddings, $this->chunking);
    }

    public function test_has_correct_timeout(): void
    {
        $job = new ProcessDocumentJob('test');

        $this->assertSame(300, $job->timeout);
    }
}
