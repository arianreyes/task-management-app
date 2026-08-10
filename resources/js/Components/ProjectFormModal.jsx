import { useForm } from '@inertiajs/react';

const STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

export default function ProjectFormModal({ project, onClose }) {
    const isEditing = Boolean(project);

    const { data, setData, post, put, processing, errors } = useForm({
        client_name: project?.client_name ?? '',
        project_name: project?.project_name ?? '',
        description: project?.description ?? '',
        status: project?.status ?? 'Planning',
        priority: project?.priority ?? 'Medium',
        start_date: project?.start_date ?? '',
        due_date: project?.due_date ?? '',
    });

    function handleSubmit(e) {
        e.preventDefault();

        if (isEditing) {
            put(`/projects/${project.id}`, { onSuccess: onClose });
        } else {
            post('/projects', { onSuccess: onClose });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900">
                    {isEditing ? 'Edit Project' : 'New Project'}
                </h2>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client Name</label>
                        <input
                            type="text"
                            value={data.client_name}
                            onChange={(e) => setData('client_name', e.target.value)}
                            className={inputClass}
                        />
                        {errors.client_name && <p className="mt-1 text-sm text-red-600">{errors.client_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Project Name</label>
                        <input
                            type="text"
                            value={data.project_name}
                            onChange={(e) => setData('project_name', e.target.value)}
                            className={inputClass}
                        />
                        {errors.project_name && <p className="mt-1 text-sm text-red-600">{errors.project_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className={inputClass}
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className={inputClass}
                            >
                                {STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className={inputClass}
                            >
                                {PRIORITIES.map((priority) => (
                                    <option key={priority} value={priority}>
                                        {priority}
                                    </option>
                                ))}
                            </select>
                            {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className={inputClass}
                            />
                            {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                                className={inputClass}
                            />
                            {errors.due_date && <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isEditing ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
