import { useRef, useEffect } from 'react';
import TodoItem from './TodoItem';

/**
 * Task list container component coordinating filters, search query filtering, 
 * shortcut bindings to autofocus inputs, reordering coordinates, and empty placeholders.
 */
export default function TodoList({
  todos,
  currentFilter,
  setCurrentFilter,
  searchQuery,
  setSearchQuery,
  onToggleTodo,
  onDeleteTodo,
  onSaveEdit,
  onViewDetails,
  onReorderTodos,
  translate
}) {
  const searchInputRef = useRef(null);
  const draggedIdRef = useRef(null);

  // Keyboard shortcut Ctrl/Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter keys
  const filterTabs = [
    { key: 'today', label: translate('today') },
    { key: 'active', label: translate('active') },
    { key: 'completed', label: translate('completed') },
    { key: 'high', label: translate('high') },
    { key: 'all', label: translate('all') }
  ];

  // Drag and drop logic
  const handleDragStart = (e, id) => {
    draggedIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedIdRef.current !== null && draggedIdRef.current !== targetId) {
      onReorderTodos(draggedIdRef.current, targetId);
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search & Filters */}
      <div className="todo-list-header">
        <div className="search-bar-container">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder={translate('searchTasks')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="shortcut-badge">⌘K</span>
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
        </div>

        <div className="filter-tabs">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab-btn ${currentFilter === tab.key ? 'active' : ''}`}
              onClick={() => setCurrentFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List container */}
      {todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div className="empty-state-text">{translate('noTasks')}</div>
        </div>
      ) : (
        <ul className="todo-items-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleTodo={onToggleTodo}
              onDeleteTodo={onDeleteTodo}
              onSaveEdit={onSaveEdit}
              onViewDetails={onViewDetails}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              translate={translate}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
