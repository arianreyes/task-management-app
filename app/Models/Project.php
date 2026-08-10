<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'client_name',
    'project_name',
    'description',
    'status',
    'priority',
    'start_date',
    'due_date',
])]
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'priority' => ProjectPriority::class,
            'start_date' => 'date',
            'due_date' => 'date',
        ];
    }

    /**
     * Scope a query to projects whose client or project name matches the given term.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        return $term ? $query->where(function (Builder $query) use ($term) {
            $query->where('client_name', 'like', "%{$term}%")
                ->orWhere('project_name', 'like', "%{$term}%");
        }) : $query;
    }

    /**
     * Scope a query to a specific status value.
     */
    public function scopeFilterStatus(Builder $query, ?string $status): Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }

    /**
     * Scope a query to a specific priority value.
     */
    public function scopeFilterPriority(Builder $query, ?string $priority): Builder
    {
        return $priority ? $query->where('priority', $priority) : $query;
    }

    /**
     * Scope a query to be sorted by an allow-listed column and direction.
     */
    public function scopeSort(Builder $query, ?string $column, ?string $direction): Builder
    {
        $allowedColumns = ['client_name', 'project_name', 'status', 'priority', 'start_date', 'due_date'];
        $column = in_array($column, $allowedColumns, true) ? $column : 'id';
        $direction = $direction === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($column, $direction);
    }
}
