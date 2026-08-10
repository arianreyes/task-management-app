<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $projects = Project::query()
            ->search($request->query('search'))
            ->filterStatus($request->query('status'))
            ->filterPriority($request->query('priority'))
            ->sort($request->query('sort_by'), $request->query('sort_dir'))
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects->map(fn (Project $project) => (new ProjectResource($project))->resolve()),
            'filters' => $request->only(['search', 'status', 'priority', 'sort_by', 'sort_dir']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        Project::create($request->validated());

        return redirect()->route('projects.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());

        return redirect()->route('projects.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index');
    }
}
