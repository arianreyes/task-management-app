<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'client_name' => 'Acme Corporation',
            'project_name' => 'Website Redesign',
            'description' => 'A test project.',
            'status' => 'Planning',
            'priority' => 'Medium',
            'start_date' => '2026-01-01',
            'due_date' => '2026-02-01',
        ], $overrides);
    }

    // --- Validation ---

    public function test_creating_a_project_requires_client_name(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['client_name' => '']));

        $response->assertStatus(422)->assertJsonValidationErrors(['client_name']);
    }

    public function test_creating_a_project_requires_project_name(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['project_name' => '']));

        $response->assertStatus(422)->assertJsonValidationErrors(['project_name']);
    }

    public function test_creating_a_project_requires_a_valid_status(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['status' => 'Bogus']));

        $response->assertStatus(422)->assertJsonValidationErrors(['status']);
    }

    public function test_creating_a_project_requires_a_valid_priority(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload(['priority' => 'Urgent']));

        $response->assertStatus(422)->assertJsonValidationErrors(['priority']);
    }

    public function test_due_date_cannot_be_earlier_than_start_date(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload([
            'start_date' => '2026-03-01',
            'due_date' => '2026-02-01',
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['due_date']);
    }

    public function test_due_date_equal_to_start_date_is_valid(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload([
            'start_date' => '2026-03-01',
            'due_date' => '2026-03-01',
        ]));

        $response->assertStatus(201);
    }

    public function test_a_project_can_be_created_with_valid_data(): void
    {
        $response = $this->postJson('/api/projects', $this->validPayload());

        $response->assertStatus(201)
            ->assertJsonPath('data.client_name', 'Acme Corporation')
            ->assertJsonPath('data.status', 'Planning');

        $this->assertDatabaseHas('projects', [
            'client_name' => 'Acme Corporation',
            'project_name' => 'Website Redesign',
        ]);
    }

    public function test_updating_a_project_validates_the_same_rules(): void
    {
        $project = Project::factory()->create();

        $response = $this->putJson("/api/projects/{$project->id}", $this->validPayload([
            'status' => 'NotAStatus',
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors(['status']);
    }

    public function test_a_project_can_be_updated_with_valid_data(): void
    {
        $project = Project::factory()->create(['client_name' => 'Old Client']);

        $response = $this->putJson("/api/projects/{$project->id}", $this->validPayload([
            'client_name' => 'New Client',
        ]));

        $response->assertStatus(200)->assertJsonPath('data.client_name', 'New Client');
        $this->assertDatabaseHas('projects', ['id' => $project->id, 'client_name' => 'New Client']);
    }

    // --- Search ---

    public function test_search_matches_by_client_name(): void
    {
        Project::factory()->create(['client_name' => 'Acme Corporation']);
        Project::factory()->create(['client_name' => 'GreenLeaf Cafe']);

        $response = $this->getJson('/api/projects?search=Acme');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.client_name', 'Acme Corporation');
    }

    public function test_search_matches_by_project_name(): void
    {
        Project::factory()->create(['project_name' => 'Booking Platform Enhancement']);
        Project::factory()->create(['project_name' => 'Inventory Management System']);

        $response = $this->getJson('/api/projects?search=Booking');

        $response->assertStatus(200)->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.project_name', 'Booking Platform Enhancement');
    }

    public function test_search_with_no_matches_returns_empty_list(): void
    {
        Project::factory()->create(['client_name' => 'Acme Corporation']);

        $response = $this->getJson('/api/projects?search=NoSuchClient');

        $response->assertStatus(200)->assertJsonCount(0, 'data');
    }

    // --- Filter by status ---

    public function test_filtering_by_status_returns_only_matching_projects(): void
    {
        Project::factory()->create(['status' => 'Planning']);
        Project::factory()->create(['status' => 'Planning']);
        Project::factory()->create(['status' => 'Completed']);

        $response = $this->getJson('/api/projects?status=Planning');

        $response->assertStatus(200)->assertJsonCount(2, 'data');
        collect($response->json('data'))->each(
            fn (array $project) => $this->assertSame('Planning', $project['status'])
        );
    }

    public function test_filtering_by_unused_status_returns_empty_list(): void
    {
        Project::factory()->create(['status' => 'Planning']);

        $response = $this->getJson('/api/projects?status=Completed');

        $response->assertStatus(200)->assertJsonCount(0, 'data');
    }

    // --- Filter by priority ---

    public function test_filtering_by_priority_returns_only_matching_projects(): void
    {
        Project::factory()->create(['priority' => 'High']);
        Project::factory()->create(['priority' => 'Low']);
        Project::factory()->create(['priority' => 'High']);

        $response = $this->getJson('/api/projects?priority=High');

        $response->assertStatus(200)->assertJsonCount(2, 'data');
        collect($response->json('data'))->each(
            fn (array $project) => $this->assertSame('High', $project['priority'])
        );
    }

    public function test_status_and_priority_filters_can_be_combined(): void
    {
        Project::factory()->create(['status' => 'In Progress', 'priority' => 'High']);
        Project::factory()->create(['status' => 'In Progress', 'priority' => 'Low']);
        Project::factory()->create(['status' => 'Completed', 'priority' => 'High']);

        $response = $this->getJson('/api/projects?'.http_build_query(['status' => 'In Progress', 'priority' => 'High']));

        $response->assertStatus(200)->assertJsonCount(1, 'data');
    }

    // --- Sorting ---

    public function test_sorting_by_due_date_ascending(): void
    {
        Project::factory()->create(['due_date' => '2026-03-01', 'client_name' => 'Later']);
        Project::factory()->create(['due_date' => '2026-01-01', 'client_name' => 'Earliest']);
        Project::factory()->create(['due_date' => '2026-02-01', 'client_name' => 'Middle']);

        $response = $this->getJson('/api/projects?sort_by=due_date&sort_dir=asc');

        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('client_name')->all();
        $this->assertSame(['Earliest', 'Middle', 'Later'], $names);
    }

    public function test_sorting_by_due_date_descending(): void
    {
        Project::factory()->create(['due_date' => '2026-03-01', 'client_name' => 'Later']);
        Project::factory()->create(['due_date' => '2026-01-01', 'client_name' => 'Earliest']);
        Project::factory()->create(['due_date' => '2026-02-01', 'client_name' => 'Middle']);

        $response = $this->getJson('/api/projects?sort_by=due_date&sort_dir=desc');

        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('client_name')->all();
        $this->assertSame(['Later', 'Middle', 'Earliest'], $names);
    }

    public function test_sorting_by_client_name(): void
    {
        Project::factory()->create(['client_name' => 'Zeta Inc']);
        Project::factory()->create(['client_name' => 'Alpha LLC']);

        $response = $this->getJson('/api/projects?sort_by=client_name&sort_dir=asc');

        $names = collect($response->json('data'))->pluck('client_name')->all();
        $this->assertSame(['Alpha LLC', 'Zeta Inc'], $names);
    }

    public function test_sorting_with_an_unrecognized_column_falls_back_safely(): void
    {
        Project::factory()->count(3)->create();

        $response = $this->getJson('/api/projects?'.http_build_query([
            'sort_by' => '1; drop table projects; --',
            'sort_dir' => 'asc',
        ]));

        $response->assertStatus(200)->assertJsonCount(3, 'data');
    }
}
