import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import ProjectFormModal from '../../Components/ProjectFormModal';
import { StatusBadge, PriorityBadge } from '../../Components/Badges';

const STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const COLUMNS = [
    { key: 'client_name', label: 'Client' },
    { key: 'project_name', label: 'Project' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'due_date', label: 'Due Date' },
];

const selectClass =
    'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function Index({ projects, filters }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [priority, setPriority] = useState(filters.priority ?? '');
    const sortBy = filters.sort_by ?? 'id';
    const sortDir = filters.sort_dir ?? 'asc';

    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters({ search });
        }, 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function applyFilters(overrides = {}) {
        router.get(
            '/',
            {
                search,
                status,
                priority,
                sort_by: sortBy,
                sort_dir: sortDir,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }

    function handleStatusChange(value) {
        setStatus(value);
        applyFilters({ status: value });
    }

    function handlePriorityChange(value) {
        setPriority(value);
        applyFilters({ priority: value });
    }

    function handleSort(column) {
        const nextDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort_by: column, sort_dir: nextDir });
    }

    function clearFilters() {
        setSearch('');
        setStatus('');
        setPriority('');
        router.get(
            '/',
            { sort_by: sortBy, sort_dir: sortDir },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }

    function closeModal() {
        setIsCreating(false);
        setEditingProject(null);
    }

    function handleDelete(project) {
        if (confirm(`Delete "${project.project_name}" for ${project.client_name}? This cannot be undone.`)) {
            router.delete(`/projects/${project.id}`);
        }
    }

    const hasActiveFilters = search || status || priority;

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Client Project Tracker</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {projects.length} project{projects.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        + New Project
                    </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by client or project name..."
                        className={`${selectClass} w-64`}
                    />
                    <select value={status} onChange={(e) => handleStatusChange(e.target.value)} className={selectClass}>
                        <option value="">All Statuses</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                    <select value={priority} onChange={(e) => handlePriorityChange(e.target.value)} className={selectClass}>
                        <option value="">All Priorities</option>
                        {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            Clear filters
                        </button>
                    )}
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {COLUMNS.map((column) => (
                                    <th
                                        key={column.key}
                                        onClick={() => handleSort(column.key)}
                                        className="cursor-pointer select-none px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 hover:text-gray-700"
                                    >
                                        {column.label}
                                        {sortBy === column.key && (
                                            <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                                        )}
                                    </th>
                                ))}
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                        {hasActiveFilters
                                            ? 'No projects match your filters.'
                                            : 'No projects yet. Create your first one.'}
                                    </td>
                                </tr>
                            )}
                            {projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{project.client_name}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-900">{project.project_name}</div>
                                        {project.description && (
                                            <div className="max-w-xs truncate text-xs text-gray-500">{project.description}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={project.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <PriorityBadge priority={project.priority} />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{project.start_date}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{project.due_date}</td>
                                    <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                                        <button
                                            onClick={() => setEditingProject(project)}
                                            className="font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project)}
                                            className="ml-3 font-medium text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {(isCreating || editingProject) && (
                <ProjectFormModal project={editingProject} onClose={closeModal} />
            )}
        </div>
    );
}
