import { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * Individual sticky note card with drag handle, inline color picker,
 * delete button, content textarea, and 8-directional resize handles.
 */
export default function StickyNoteCard({
  note,
  index,
  NOTE_COLORS,
  language,
  translate,
  activeNoteId,
  bringToFront,
  handleDragStart,
  handleResizeStart,
  handleNoteColorChange,
  handleDeleteNote,
  handleTextChange
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      const isNew = (Date.now() - note.id) < 1000;
      const delay = isNew ? 0 : index * 0.06;
      gsap.fromTo(cardRef.current,
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, delay: delay, ease: 'back.out(1.6)', clearProps: 'scale,opacity' }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const noteWidth = note.width || 180;
  const noteHeight = note.height || 180;

  return (
    <div
      ref={cardRef}
      className={`sticky-note note-theme-${note.color} ${note.id === activeNoteId ? 'is-dragging' : ''}`}
      style={{
        left: `${note.x}px`,
        top: `${note.y}px`,
        width: `${noteWidth}px`,
        height: `${noteHeight}px`,
        zIndex: note.zIndex || 1
      }}
      onMouseDown={() => bringToFront(note.id)}
      onTouchStart={() => bringToFront(note.id)}
    >
      {/* Note drag handle header */}
      <div
        className="sticky-note-header"
        onMouseDown={(e) => handleDragStart(note.id, e)}
        onTouchStart={(e) => handleDragStart(note.id, e)}
      >
        <div className="sticky-note-drag-handle" />
        
        {/* Note tools */}
        <div className="sticky-note-actions">
          {/* Inline Color Picker */}
          <div className="note-color-dots">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleNoteColorChange(note.id, c.id)}
                className="note-color-dot"
                style={{ backgroundColor: c.colorCode }}
                title={language === 'ar' ? c.labelAr : c.labelEn}
              />
            ))}
          </div>

          {/* Delete Button */}
          <button
            className="sticky-note-btn"
            onClick={() => handleDeleteNote(note.id)}
            title={language === 'ar' ? 'حذف' : 'Delete'}
            aria-label="Delete note"
          >
            <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Note Content Input */}
      <div className="sticky-note-body">
        <textarea
          className="sticky-note-textarea"
          value={note.text}
          onChange={(e) => handleTextChange(note.id, e.target.value)}
          placeholder={translate('notePlaceholder')}
        />
      </div>

      {/* 8-Way Resize Handles */}
      <div className="resize-handle rh-n" onMouseDown={(e) => handleResizeStart(note.id, 'n', e)} onTouchStart={(e) => handleResizeStart(note.id, 'n', e)} />
      <div className="resize-handle rh-s" onMouseDown={(e) => handleResizeStart(note.id, 's', e)} onTouchStart={(e) => handleResizeStart(note.id, 's', e)} />
      <div className="resize-handle rh-e" onMouseDown={(e) => handleResizeStart(note.id, 'e', e)} onTouchStart={(e) => handleResizeStart(note.id, 'e', e)} />
      <div className="resize-handle rh-w" onMouseDown={(e) => handleResizeStart(note.id, 'w', e)} onTouchStart={(e) => handleResizeStart(note.id, 'w', e)} />
      <div className="resize-handle rh-nw" onMouseDown={(e) => handleResizeStart(note.id, 'nw', e)} onTouchStart={(e) => handleResizeStart(note.id, 'nw', e)} />
      <div className="resize-handle rh-ne" onMouseDown={(e) => handleResizeStart(note.id, 'ne', e)} onTouchStart={(e) => handleResizeStart(note.id, 'ne', e)} />
      <div className="resize-handle rh-sw" onMouseDown={(e) => handleResizeStart(note.id, 'sw', e)} onTouchStart={(e) => handleResizeStart(note.id, 'sw', e)} />
      <div className="resize-handle rh-se" onMouseDown={(e) => handleResizeStart(note.id, 'se', e)} onTouchStart={(e) => handleResizeStart(note.id, 'se', e)} />
    </div>
  );
}
