# Plan: Document Ingestion + RAG Knowledge Base

Multi-tenant voice AI platform. Clients upload documents (PDFs, images) → knowledge base → flows query via `knowledge` step type → AI answers with retrieved context.

## Tech Stack
- **Vector DB**: PostgreSQL + pgvector extension
- **Embeddings**: OpenAI `text-embedding-3-small` API
- **PDF parsing**: `smalot/pdfparser` (PHP)
- **Image OCR**: OpenAI Vision API (`gpt-4o-mini`)
- **Text chunking**: 500 tokens, 50 overlap
- **Storage**: Laravel filesystem (local/S3)

---

## Sprint 1: Infrastructure & Models

### 1.1 Dependencies
```
composer require pgvector/pgvector
composer require smalot/pdfparser
composer require openai-php/client
```

### 1.2 Migration: documents table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| tenant_id | uuid | FK→tenants, cascade |
| name | string | |
| resource_type | string | pdf, image, csv, text, web |
| mime_type | string | |
| path | string | storage path |
| status | string | pending→processing→ready/failed |
| error | text | nullable |
| metadata | json | page_count, file_size |
| timestamps | | |

Index: `[tenant_id, status]`

### 1.3 Migration: knowledge_chunks table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| document_id | uuid | FK→documents, cascade |
| tenant_id | uuid | FK→tenants, cascade |
| chunk_index | integer | |
| content | text | extracted text |
| embedding | vector(1536) | text-embedding-3-small |
| metadata | json | nullable |

Index: `[tenant_id]` + HNSW on embedding: `CREATE INDEX ON knowledge_chunks USING hnsw (embedding vector_cosine_ops)`

### 1.4 Domain Layer
- `Document` entity, `KnowledgeChunk` entity
- `DocumentRepositoryInterface`, `KnowledgeChunkRepositoryInterface`
- `ResourceType` enum (pdf, image, csv, text, web)
- `DocumentStatus` enum (pending, processing, ready, failed)

### 1.5 Eloquent Implementations
- `DocumentModel`, `EloquentDocumentRepository`
- `ChunkModel`, `EloquentChunkRepository`

### 1.6 AppServiceProvider bindings
```php
$this->app->bind(DocumentRepositoryInterface::class, EloquentDocumentRepository::class);
$this->app->bind(KnowledgeChunkRepositoryInterface::class, EloquentChunkRepository::class);
```

---

## Sprint 2: Embedding Service & Document Processing

### 2.1 `EmbeddingServiceInterface`
```php
interface EmbeddingServiceInterface
{
    public function embedMany(array $texts): array;
    public function embed(string $text): array;
}
```

### 2.2 `OpenAIEmbeddingService`
- `openai-php/client` → `text-embedding-3-small`
- Dimension: 1536, batch size: 20

### 2.3 Document Processors (Strategy)
- `PdfDocumentProcessor` — smalot/pdfparser
- `ImageDocumentProcessor` — OpenAI Vision API
- `TextDocumentProcessor` — raw read
- `CsvDocumentProcessor` — rows as text

### 2.4 `ChunkingService`
- Split by paragraphs → sentences
- 500 token chunks, 50 token overlap
- Returns array of chunk texts

### 2.5 Pipeline: Upload → `ProcessDocumentJob`
1. status=processing
2. Detect mime → select processor
3. Extract text
4. Chunk text
5. Generate embeddings (batch)
6. Store chunks
7. status=ready
On fail → status=failed, store error

### 2.6 Artisan: `documents:process`
Bulk process all pending documents (fallback if queue fails)

---

## Sprint 3: Knowledge Retrieval Service

### 3.1 `KnowledgeRetrievalService`
```php
class KnowledgeRetrievalService
{
    public function retrieve(
        string $tenantId,
        string $query,
        int $topK = 5,
        ?string $resourceType = null,
        RetrievalType $type = RetrievalType::Semantic,
    ): RetrievalResult;
}
```

### 3.2 Vector Search (raw SQL → pgvector)
```sql
SELECT content, metadata, 1 - (embedding <=> :query_embedding) AS similarity
FROM knowledge_chunks
WHERE tenant_id = :tenant_id
  AND (:resource_type IS NULL OR document_id IN (
    SELECT id FROM documents WHERE resource_type = :resource_type
  ))
ORDER BY embedding <=> :query_embedding
LIMIT :top_k;
```

### 3.3 `RetrievalType` enum
- `semantic` — raw chunks as LLM context
- `summary` — summarize chunks before LLM

### 3.4 DTOs
- `RetrievalResult { chunks[], contextText, type }`
- `ChunkResult { content, similarity, documentName, metadata }`

---

## Sprint 4: Knowledge Step Type (Flow Builder)

### 4.1 Frontend: New `knowledge` step
- `flowConfig.js`: add to NODE_TYPES + NODE_DEFAULTS
- `KnowledgeNode.jsx`: teal color, shows query + topK
- `PropertiesPanel`: fields → query (textarea), topK (number), retrievalType (semantic/summary), resourceType (all/pdf/image/csv/text), systemPrompt (textarea)
- `Toolbox.jsx`: knowledge, teal, "Query knowledge base"

### 4.2 Backend: `StepType`
```php
case Knowledge = 'knowledge';
```

### 4.3 FlowExecutor: `knowledgeStep()`
1. Resolve query template with variables
2. Call `KnowledgeRetrievalService::retrieve()`
3. Build LLM context with chunks
4. Call `AiServiceInterface::chat()`
5. Return TwiML `<Say>` + `<Redirect>`

### 4.4 LLM Prompt
System: "You are a helpful voice assistant. Use the knowledge context below to answer. Keep responses concise and spoken-word friendly."
Inject: `\n## Knowledge Context\n{chunks}\n`
User: resolved query

---

## Sprint 5: Document Management UI

### 5.1 `DocumentsController` (Web)
- `index` — list with search/filter
- `create` — upload form
- `store` — handle upload, dispatch job
- `show` — document detail + chunks
- `destroy` — delete doc + chunks + file

### 5.2 Routes (auth group)
```
GET/POST  /settings/documents
GET       /settings/documents/create
GET       /settings/documents/{document}
DELETE    /settings/documents/{document}
```

### 5.3 React Pages (Catalyst)
- `Settings/Documents/Index.jsx` — Table with status badges, search, upload button
- `Settings/Documents/Create.jsx` — File picker + name + resource_type select
- `Settings/Documents/Show.jsx` — Document info + chunk content preview list

### 5.4 Sidebar: Add "Documents" under Settings

---

## Sprint 6: Tests & Polish

### 6.1 Unit Tests
- `ChunkingServiceTest` — splitting, overlap, empty
- `OpenAIEmbeddingServiceTest` — mock HTTP, batching
- Document processors — mock filesystem

### 6.2 Feature Tests
- Upload → pending record
- Processing → chunks created
- Retrieval → correct chunks returned
- Knowledge step → TwiML with AI response
- Multi-tenant isolation
- Auth required (redirect)
- Invalid file type (validation)
- Deletion cascades
- Failed document handling

### 6.3 Verification
- `php artisan test` ✅
- `vendor/bin/pint --format agent` ✅
- `composer phpstan` 0 errors ✅
- `pnpm run build` 0 errors ✅

---

## File Inventory

### New (~30)
- 2 migrations
- 6 domain classes (entities, VOs, repos)
- 6 persistence (models, repos)
- 1 embedding service
- 4 document processors + interface
- 1 chunking service
- 1 retrieval service
- 1 queue job
- 1 artisan command
- 1 controller + 1 form request
- 3 React pages
- 1 FlowBuilder KnowledgeNode

### Modified (~12)
- composer.json, AppServiceProvider, StepType, FlowExecutor
- flowConfig.js, PropertiesPanel.jsx, nodes/index.js, Toolbox.jsx
- AuthenticatedLayout.jsx, routes/web.php
- .env.example
- Test files (~10 new)

---

## Sprint Schedule

| Sprint | Focus | Files |
|--------|-------|-------|
| 1 | Infrastructure & Models | ~12 new, ~3 modified |
| 2 | Embedding & Processing | ~10 new, ~2 modified |
| 3 | Knowledge Retrieval | ~3 new, ~1 modified |
| 4 | Knowledge Step Type | ~2 new, ~6 modified |
| 5 | Document UI | ~4 new, ~2 modified |
| 6 | Tests & Polish | ~10 new, ~1 modified |

**Total**: ~30 new files, ~15 modified files
