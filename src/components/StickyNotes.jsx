import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import ConfirmModal from './ConfirmModal';

// Theme-compatible sticky note colors
const NOTE_COLORS = [
  { id: 'yellow', labelEn: 'Yellow', labelAr: 'أصفر', colorCode: '#fef08a' },
  { id: 'pink', labelEn: 'Pink', labelAr: 'وردي', colorCode: '#fecdd3' },
  { id: 'blue', labelEn: 'Blue', labelAr: 'أزرق', colorCode: '#bfdbfe' },
  { id: 'green', labelEn: 'Green', labelAr: 'أخضر', colorCode: '#bbf7d0' },
  { id: 'purple', labelEn: 'Purple', labelAr: 'بنفسجي', colorCode: '#e9d5ff' },
  { id: 'orange', labelEn: 'Orange', labelAr: 'برتقالي', colorCode: '#fed7aa' }
];

export default function StickyNotes({ notes, setNotes, translate, language }) {
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });
  const canvasRef = useRef(null);

  // Bring a note to front by setting its z-index to maximum
  const bringToFront = (noteId) => {
    setNotes((prevNotes) => {
      const maxZ = prevNotes.reduce((max, note) => Math.max(max, note.zIndex || 1), 1);
      return prevNotes.map((note) =>
        note.id === noteId ? { ...note, zIndex: maxZ + 1 } : note
      );
    });
  };

  // Add a new sticky note
  const handleAddNote = (x = 40, y = 40) => {
    // Generate a unique ID
    const newNote = {
      id: Date.now(),
      text: '',
      x,
      y,
      width: 180,
      height: 180,
      color: selectedColor,
      zIndex: notes.length > 0 ? Math.max(...notes.map((n) => n.zIndex || 1)) + 1 : 1
    };
    setNotes((prev) => [...prev, newNote]);
  };

  // Double click canvas to spawn a note
  const handleCanvasDoubleClick = (e) => {
    if (e.target !== canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate click coordinates relative to the canvas
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Center the newly spawned note on the cursor (default size 180x180)
    let spawnX = clickX - 90;
    let spawnY = clickY - 20;

    // Apply snapping if active
    if (snapToGrid) {
      spawnX = Math.round(spawnX / 20) * 20;
      spawnY = Math.round(spawnY / 20) * 20;
    }

    // Clamp coordinates to stay within boundaries
    const maxX = rect.width - 180;
    const maxY = rect.height - 180;
    spawnX = Math.max(0, Math.min(spawnX, maxX));
    spawnY = Math.max(0, Math.min(spawnY, maxY));

    handleAddNote(spawnX, spawnY);
  };

  // Delete a single note
  const handleDeleteNote = (noteId) => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'حذف الملاحظة' : 'Delete Note',
      message: language === 'ar' ? 'هل أنت متأكد من حذف هذه الملاحظة؟' : 'Are you sure you want to delete this note?',
      onConfirm: () => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    });
  };

  // Clear all notes on canvas
  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: language === 'ar' ? 'مسح لوحة الملاحظات' : 'Clear Canvas',
      message: language === 'ar' 
        ? 'هل أنت متأكد من حذف جميع الملاحظات من لوحة العمل؟' 
        : 'Are you sure you want to delete all notes from the canvas?',
      onConfirm: () => {
        setNotes([]);
      }
    });
  };

  // Update note text content
  const handleTextChange = (noteId, newText) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, text: newText } : note))
    );
  };

  // Update note color after creation
  const handleNoteColorChange = (noteId, newColor) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === noteId ? { ...note, color: newColor } : note))
    );
  };

  // Custom Mouse Drag Handler
  const handleDragStart = (noteId, e) => {
    // Bring note to front
    bringToFront(noteId);
    setActiveNoteId(noteId);

    // Prevent dragging if clicked on textarea or action buttons
    if (e.target.tagName === 'TEXTAREA' || e.target.closest('.sticky-note-btn')) {
      setActiveNoteId(null);
      return;
    }

    e.preventDefault();

    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const note = notes.find((n) => n.id === noteId);
    if (!note) {
      setActiveNoteId(null);
      return;
    }

    const initialX = note.x;
    const initialY = note.y;
    const initialMouseX = clientX;
    const initialMouseY = clientY;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const noteWidth = note.width || 180;
    const noteHeight = note.height || 180;

    const handleDragMove = (moveEvent) => {
      const currentX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentX - initialMouseX;
      const deltaY = currentY - initialMouseY;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      if (snapToGrid) {
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;
      }

      // Clamp coordinates to the canvas bounds
      const maxX = canvasRect.width - noteWidth;
      const maxY = canvasRect.height - noteHeight;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === noteId ? { ...n, x: newX, y: newY } : n))
      );
    };

    const handleDragEnd = () => {
      setActiveNoteId(null);
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  };

  // Custom Mouse Resize Handler
  const handleResizeStart = (noteId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveNoteId(noteId);

    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const note = notes.find((n) => n.id === noteId);
    if (!note) {
      setActiveNoteId(null);
      return;
    }

    const initialX = note.x;
    const initialWidth = note.width || 180;
    const initialHeight = note.height || 180;
    const initialMouseX = clientX;
    const initialMouseY = clientY;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const isRtl = document.documentElement.dir === 'rtl';

    const handleResizeMove = (moveEvent) => {
      const currentX = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY;

      const deltaX = currentX - initialMouseX;
      const deltaY = currentY - initialMouseY;

      let newWidth, newHeight;
      let newX = note.x;

      if (isRtl) {
        // Resizing from the bottom-left corner in RTL
        newWidth = initialWidth - deltaX;
        newHeight = initialHeight + deltaY;

        // Snapping sizing if snapToGrid is checked
        if (snapToGrid) {
          newWidth = Math.round(newWidth / 20) * 20;
          newHeight = Math.round(newHeight / 20) * 20;
        }

        // Clamp width (Min: 160px, Max: note's current right boundary starting from left)
        const maxWidth = initialX + initialWidth;
        newWidth = Math.max(160, Math.min(newWidth, maxWidth));
        
        // Shifting coordinates leftwards as note expands leftwards
        newX = initialX + initialWidth - newWidth;
      } else {
        // Resizing from bottom-right corner in LTR
        newWidth = initialWidth + deltaX;
        newHeight = initialHeight + deltaY;

        if (snapToGrid) {
          newWidth = Math.round(newWidth / 20) * 20;
          newHeight = Math.round(newHeight / 20) * 20;
        }

        // Clamp width (Min: 160px, Max: remaining canvas space on right)
        const maxWidth = canvasRect.width - initialX;
        newWidth = Math.max(160, Math.min(newWidth, maxWidth));
      }

      // Clamp height (Min: 160px, Max: remaining canvas space below)
      const maxHeight = canvasRect.height - note.y;
      newHeight = Math.max(160, Math.min(newHeight, maxHeight));

      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === noteId ? { ...n, width: newWidth, height: newHeight, x: newX } : n
        )
      );
    };

    const handleResizeEnd = () => {
      setActiveNoteId(null);
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchmove', handleResizeMove, { passive: false });
    window.addEventListener('touchend', handleResizeEnd);
  };

  const portalSlot = document.getElementById('header-portal-slot');

  return (
    <div className="sticky-workspace">
      {portalSlot && createPortal(
        <div className="compact-header-toolbar">
          {/* Note color picker before placing */}
          <div className="compact-color-selector">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                className={`compact-color-dot ${selectedColor === c.id ? 'active' : ''}`}
                style={{ backgroundColor: c.colorCode }}
                title={language === 'ar' ? c.labelAr : c.labelEn}
                aria-label={language === 'ar' ? c.labelAr : c.labelEn}
              />
            ))}
          </div>

          <div className="divider-vr" />

          {/* Snap grid selection */}
          <label className="compact-snap-toggle">
            <input
              type="checkbox"
              className="snap-checkbox"
              checked={snapToGrid}
              onChange={(e) => setSnapToGrid(e.target.checked)}
            />
            <span>{language === 'ar' ? 'محاذاة' : 'Snap'}</span>
          </label>

          <div className="divider-vr" />

          <button className="compact-btn compact-btn-add" onClick={() => handleAddNote(40, 40)}>
            {language === 'ar' ? '+ ملاحظة' : '+ Note'}
          </button>
          
          <button 
            className="compact-btn compact-btn-clear" 
            onClick={handleClearAll}
            disabled={notes.length === 0}
          >
            {language === 'ar' ? 'مسح' : 'Clear'}
          </button>
        </div>,
        portalSlot
      )}

      {/* Workspace Interactive Canvas */}
      <div
        ref={canvasRef}
        className="sticky-canvas"
        onDoubleClick={handleCanvasDoubleClick}
        title={translate('doubleClickSpawn')}
      >
        {/* Placeholder if empty */}
        {notes.length === 0 && (
          <div className="sticky-canvas-placeholder">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '0.5rem' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>{translate('doubleClickSpawn')}</p>
          </div>
        )}

        {/* Render sticky notes */}
        {notes.map((note, index) => {
          const stableRotation = note.rotate !== undefined ? note.rotate : (((note.id % 7) - 3) * 0.8).toFixed(1);
          return (
            <StickyNoteCard
              key={note.id}
              note={note}
              index={index}
              NOTE_COLORS={NOTE_COLORS}
              language={language}
              translate={translate}
              activeNoteId={activeNoteId}
              stableRotation={stableRotation}
              bringToFront={bringToFront}
              handleDragStart={handleDragStart}
              handleResizeStart={handleResizeStart}
              handleNoteColorChange={handleNoteColorChange}
              handleDeleteNote={handleDeleteNote}
              handleTextChange={handleTextChange}
            />
          );
        })}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        language={language}
      />
    </div>
  );
}

function StickyNoteCard({
  note,
  index,
  NOTE_COLORS,
  language,
  translate,
  activeNoteId,
  stableRotation,
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
        zIndex: note.zIndex || 1,
        '--stable-rot': `${stableRotation}deg`
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

      {/* Note Resize Handle */}
      <div
        className="sticky-note-resize-handle"
        onMouseDown={(e) => handleResizeStart(note.id, e)}
        onTouchStart={(e) => handleResizeStart(note.id, e)}
      />
    </div>
  );
}
