<?php

namespace Tests\Feature\Web;

use App\Infrastructure\Persistence\Eloquent\Knowledge\DocumentModel;
use App\Models\User;
use Database\Factories\TenantFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentsPageTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        $tenant = TenantFactory::new()->create();
        $this->user = User::factory()->create(['tenant_id' => $tenant->id]);
    }

    public function test_index_requires_authentication(): void
    {
        $this->get('/settings/documents')->assertRedirect('/login');
    }

    public function test_index_renders(): void
    {
        $this->actingAs($this->user)->get('/settings/documents')->assertOk();
    }

    public function test_create_requires_authentication(): void
    {
        $this->get('/settings/documents/create')->assertRedirect('/login');
    }

    public function test_create_renders(): void
    {
        $this->actingAs($this->user)->get('/settings/documents/create')->assertOk();
    }

    public function test_store_creates_document(): void
    {
        $file = UploadedFile::fake()->create('test.txt', 100);

        $this->actingAs($this->user)
            ->post('/settings/documents', [
                'file' => $file,
                'resource_type' => 'text',
                'name' => 'Test Document',
            ])
            ->assertRedirect(route('settings.documents.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('documents', [
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Document',
            'resource_type' => 'text',
        ]);

        Storage::disk('local')->assertExists('documents/'.$this->user->tenant_id.'/'.$file->hashName());
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->user)
            ->post('/settings/documents', [])
            ->assertSessionHasErrors(['file', 'resource_type']);
    }

    public function test_store_validates_resource_type(): void
    {
        $file = UploadedFile::fake()->create('test.txt', 100);

        $this->actingAs($this->user)
            ->post('/settings/documents', [
                'file' => $file,
                'resource_type' => 'invalid',
            ])
            ->assertSessionHasErrors('resource_type');
    }

    public function test_store_requires_authentication(): void
    {
        $this->post('/settings/documents', [])->assertRedirect('/login');
    }

    public function test_store_uses_original_filename_when_no_name_given(): void
    {
        $file = UploadedFile::fake()->create('original-name.txt', 100);

        $this->actingAs($this->user)
            ->post('/settings/documents', [
                'file' => $file,
                'resource_type' => 'text',
            ])
            ->assertRedirect(route('settings.documents.index'));

        $this->assertDatabaseHas('documents', [
            'tenant_id' => $this->user->tenant_id,
            'name' => 'original-name.txt',
        ]);
    }

    public function test_show_requires_authentication(): void
    {
        $doc = $this->createDocument();

        $this->get("/settings/documents/{$doc->id}")->assertRedirect('/login');
    }

    public function test_show_renders(): void
    {
        $doc = $this->createDocument();

        $this->actingAs($this->user)
            ->get("/settings/documents/{$doc->id}")
            ->assertOk();
    }

    public function test_show_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $doc = DocumentModel::create([
            'tenant_id' => $otherTenant->id,
            'name' => 'Other Doc',
            'resource_type' => 'text',
            'mime_type' => 'text/plain',
            'path' => 'documents/some-path',
        ]);

        $this->actingAs($this->user)
            ->get("/settings/documents/{$doc->id}")
            ->assertNotFound();
    }

    public function test_destroy_deletes_document(): void
    {
        $file = UploadedFile::fake()->create('delete-me.txt', 100);
        $path = $file->store("documents/{$this->user->tenant_id}");

        $doc = DocumentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Delete Me',
            'resource_type' => 'text',
            'mime_type' => 'text/plain',
            'path' => $path,
        ]);

        $this->actingAs($this->user)
            ->delete("/settings/documents/{$doc->id}")
            ->assertRedirect(route('settings.documents.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('documents', ['id' => $doc->id]);
        Storage::disk('local')->assertMissing($path);
    }

    public function test_destroy_scoped_to_tenant(): void
    {
        $otherTenant = TenantFactory::new()->create();
        $doc = DocumentModel::create([
            'tenant_id' => $otherTenant->id,
            'name' => 'Other Doc',
            'resource_type' => 'text',
            'mime_type' => 'text/plain',
            'path' => 'documents/other',
        ]);

        $this->actingAs($this->user)
            ->delete("/settings/documents/{$doc->id}")
            ->assertNotFound();
    }

    public function test_reprocess_queues_document(): void
    {
        Queue::fake();

        $doc = DocumentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Reprocess Me',
            'resource_type' => 'text',
            'mime_type' => 'text/plain',
            'path' => 'documents/test',
            'status' => 'failed',
        ]);

        $this->actingAs($this->user)
            ->post("/settings/documents/{$doc->id}/reprocess")
            ->assertRedirect(route('settings.documents.show', $doc->id))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('documents', [
            'id' => $doc->id,
            'status' => 'pending',
        ]);
    }

    public function test_upload_file_api_creates_document(): void
    {
        $file = UploadedFile::fake()->create('api-doc.txt', 100);

        $response = $this->actingAs($this->user)
            ->post('/settings/documents/upload', [
                'file' => $file,
                'resource_type' => 'text',
            ]);

        $response->assertOk();
        $response->assertJsonStructure(['status', 'document' => ['id', 'name', 'status']]);
        $this->assertSame('uploaded', $response->json('status'));
    }

    public function test_upload_file_validates_input(): void
    {
        $this->actingAs($this->user)
            ->post('/settings/documents/upload', [])
            ->assertSessionHasErrors(['file', 'resource_type']);
    }

    public function test_destroy_requires_authentication(): void
    {
        $this->delete('/settings/documents/some-id')->assertRedirect('/login');
    }

    private function createDocument(): DocumentModel
    {
        return DocumentModel::create([
            'tenant_id' => $this->user->tenant_id,
            'name' => 'Test Doc',
            'resource_type' => 'text',
            'mime_type' => 'text/plain',
            'path' => 'documents/test-path',
        ]);
    }
}
