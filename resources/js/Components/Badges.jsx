const STATUS_STYLES = {
    Planning: 'bg-gray-100 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-amber-100 text-amber-700',
    Completed: 'bg-green-100 text-green-700',
};

const PRIORITY_STYLES = {
    Low: 'bg-gray-100 text-gray-700',
    Medium: 'bg-orange-100 text-orange-700',
    High: 'bg-red-100 text-red-700',
};

function Badge({ label, className }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}

export function StatusBadge({ status }) {
    return <Badge label={status} className={STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700'} />;
}

export function PriorityBadge({ priority }) {
    return <Badge label={priority} className={PRIORITY_STYLES[priority] ?? 'bg-gray-100 text-gray-700'} />;
}
