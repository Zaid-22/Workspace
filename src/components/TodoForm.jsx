import { useState } from 'react';

/**
 * Task creation form component. Keeps the UI compact by default, and allows
 * users to toggle "More Options" to customize priority, category, target time, and notes.
 */
export default function TodoForm({ onAddTodo, translate }) {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('study');
  const [note, setNote] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddTodo({
      text: text.trim(),
      time: time || null,
      priority,
      category,
      note: note.trim() || null
    });

    // Reset fields
    setText('');
    setTime('');
    setPriority('medium');
    setCategory('study');
    setNote('');
    setShowOptions(false);
  };

  const priorityOptions = [
    { value: 'high', label: translate('highPriority') },
    { value: 'medium', label: translate('mediumPriority') },
    { value: 'low', label: translate('lowPriority') }
  ];

  const categoryOptions = [
    { value: 'study', label: translate('study') },
    { value: 'work', label: translate('work') },
    { value: 'personal', label: translate('personal') },
    { value: 'shopping', label: translate('shopping') },
    { value: 'health', label: translate('health') },
    { value: 'other', label: translate('other') }
  ];

  return (
    <div className="glass-panel todo-form-container">
      <form onSubmit={handleSubmit} className="todo-form">
        <div className="todo-form-main-row">
          <div className="input-glow-group">
            <input
              type="text"
              className="input-main"
              placeholder={translate('addNewTask')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              aria-label="Task text"
            />
          </div>
          <button type="submit" className="btn-add-task">
            <span>{translate('addTask')}</span>
          </button>
        </div>

        {/* Toggle options trigger */}
        <button
          type="button"
          className="form-options-toggle"
          onClick={() => setShowOptions(!showOptions)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          <span>{showOptions ? translate('lessOptions') : translate('moreOptions')}</span>
          <span>{showOptions ? '▲' : '▼'}</span>
        </button>

        {/* Expandable options panel */}
        {showOptions && (
          <div className="form-expandable-options">
            <div className="option-field">
              <label>{translate('lowPriority').replace('Priority', '') /* General Priority label */ || 'Priority'}</label>
              <select
                className="select-main"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="option-field">
              <label>Category</label>
              <select
                className="select-main"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="option-field">
              <label>Target Time</label>
              <input
                type="time"
                className="input-sub"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-label="Target time"
              />
            </div>

            <div className="option-field form-textarea-row">
              <label>{translate('addNote')}</label>
              <input
                type="text"
                className="input-sub"
                placeholder={translate('addNotes')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
