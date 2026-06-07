import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Single task item — priority border, animated checkbox, inline edit,
 * category/time/priority badges, and hover-reveal actions.
 */
export default function TodoItem({
  todo,
  onToggleTodo,
  onDeleteTodo,
  onSaveEdit,
  onViewDetails,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  translate
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [justCompleted, setJustCompleted] = useState(false);
  const editInputRef = useRef(null);
  const cardRef = useRef(null);
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 15, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.2)', clearProps: 'transform,opacity,scale' }
      );
    }
  }, []);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== todo.text) {
      onSaveEdit(todo.id, editText.trim());
    } else {
      setEditText(todo.text);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSubmit();
    else if (e.key === 'Escape') { setEditText(todo.text); setIsEditing(false); }
  };

  const handleToggle = () => {
    if (checkboxRef.current) {
      gsap.fromTo(checkboxRef.current,
        { scale: 0.8 },
        { scale: 1, duration: 0.25, ease: 'back.out(2.5)', clearProps: 'transform' }
      );
    }
    if (!todo.completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 700);
    }
    onToggleTodo(todo.id);
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const categoryMeta = {
    study: {
      label: 'study',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
    work: {
      label: 'work',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      )
    },
    personal: {
      label: 'personal',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    shopping: {
      label: 'shopping',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    health: {
      label: 'health',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      )
    },
    other: {
      label: 'other',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      )
    }
  };

  const priorityMeta = {
    high: {
      color: 'var(--priority-high)',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    },
    medium: {
      color: 'var(--priority-medium)',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    },
    low: {
      color: 'var(--priority-low)',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    }
  };

  const cat = categoryMeta[todo.category] || categoryMeta.other;
  const pri = priorityMeta[todo.priority] || priorityMeta.low;

  return (
    <li
      ref={cardRef}
      data-id={todo.id}
      className={[
        'todo-item-card',
        `priority-${todo.priority}`,
        todo.completed ? 'completed' : '',
        justCompleted ? 'just-completed' : '',
      ].filter(Boolean).join(' ')}
      draggable
      onDragStart={(e) => onDragStart(e, todo.id)}
      onDragOver={(e) => onDragOver(e, todo.id)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, todo.id)}
    >
      {/* Priority accent stripe */}

      {/* Drag handle */}
      <div className="drag-handle" title="Drag to reorder" aria-hidden="true">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" opacity="0.4">
          <circle cx="2.5" cy="2.5" r="1.5"/>
          <circle cx="7.5" cy="2.5" r="1.5"/>
          <circle cx="2.5" cy="8" r="1.5"/>
          <circle cx="7.5" cy="8" r="1.5"/>
          <circle cx="2.5" cy="13.5" r="1.5"/>
          <circle cx="7.5" cy="13.5" r="1.5"/>
        </svg>
      </div>

      {/* Custom Checkbox */}
      <label className="todo-checkbox-wrapper" title={todo.completed ? 'Mark as active' : 'Mark as complete'}>
        <input
          type="checkbox"
          className="todo-checkbox-native"
          checked={todo.completed}
          onChange={handleToggle}
        />
        <div ref={checkboxRef} className="todo-checkbox-custom">
          {todo.completed && (
            <svg className="check-svg" viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,5 4,9 11,1" />
            </svg>
          )}
        </div>
      </label>

      {/* Content / Inline editor */}
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          className="todo-inline-edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEditSubmit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div
          className="todo-item-content"
          onClick={() => onViewDetails(todo.id)}
          title="Click to view details"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onViewDetails(todo.id)}
        >
          <span className="todo-item-title">{todo.text}</span>
          <div className="todo-item-meta">
            <span className={`meta-badge badge-cat-${todo.category}`}>
              {cat.icon({ width: 10, height: 10 })}
              <span>{translate(cat.label)}</span>
            </span>
            {todo.time && (
              <span className="meta-badge badge-time">
                <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{formatTime(todo.time)}</span>
              </span>
            )}
            <span
              className="meta-badge badge-priority"
              style={{ '--pri-color': pri.color }}
            >
              {pri.icon({ width: 10, height: 10 })}
              <span>{translate(todo.priority + 'Priority')}</span>
            </span>
          </div>
        </div>
      )}

      {/* Hover Actions */}
      {!isEditing && (
        <div className="todo-item-actions">
          <button
            className="btn-item-action"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            title="Edit task"
            aria-label="Edit task"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button
            className="btn-item-action btn-item-delete"
            onClick={(e) => { e.stopPropagation(); onDeleteTodo(todo.id); }}
            title="Delete task"
            aria-label="Delete task"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      )}
    </li>
  );
}
