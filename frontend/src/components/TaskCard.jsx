export default function TaskCard({ task, onDelete, onEdit, onToggle }) {
  const priorityConfig = {
    high:   { label: 'High',   className: 'badge-high' },
    medium: { label: 'Medium', className: 'badge-medium' },
    low:    { label: 'Low',    className: 'badge-low' },
  };

  const today = new Date().toISOString().split('T')[0];
  const dueDate = task.due_date?.split('T')[0];
  const createdDate = task.created_at?.split('T')[0];

  const isOverdue = task.due_date &&
    dueDate < today &&
    task.status !== 'completed' &&
    createdDate && dueDate >= createdDate;

  const isBackdated = task.due_date &&
    dueDate < today &&
    task.status !== 'completed' &&
    !isOverdue;

  const p = priorityConfig[task.priority];

  return (
    <div className={`task-card 
      ${task.status === 'completed' ? 'task-completed' : ''} 
      ${isOverdue ? 'task-overdue' : ''} 
      ${isBackdated ? 'task-backdated' : ''}`}>
      <div className="task-header">
        <input
          type="checkbox"
          checked={task.status === 'completed'}
          onChange={() => onToggle(task.id)}
        />
        <span className={`badge ${p.className}`}>{p.label}</span>
        <span className={`status-label status-${task.status}`}>
          {task.status.replace('_', ' ')}
        </span>
      </div>
      <h3 className="task-title">{task.title}</h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      {task.due_date && (
        <p className={`task-due ${isOverdue ? 'overdue-text' : ''} ${isBackdated ? 'backdated-text' : ''}`}>
          📅 {isOverdue ? 'Overdue: ' : isBackdated ? 'Backdated: ' : 'Due: '}
          {new Date(task.due_date).toLocaleDateString('en-CA', { timeZone: 'UTC' })}
        </p>
      )}
      <div className="task-actions">
        <button className="btn-edit" onClick={() => onEdit(task)}>Edit</button>
        <button className="btn-delete" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
}