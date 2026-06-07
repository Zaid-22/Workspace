import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Toast notifications manager
 */
export default function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const toastRef = useRef(null);

  const handleDismiss = useCallback(() => {
    if (toastRef.current) {
      const isRtl = document.documentElement.dir === 'rtl';
      const exitX = isRtl ? -120 : 120;
      gsap.to(toastRef.current, {
        x: exitX,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          onRemove(toast.id);
        }
      });
    } else {
      onRemove(toast.id);
    }
  }, [toast.id, onRemove]);

  useEffect(() => {
    if (toastRef.current) {
      const isRtl = document.documentElement.dir === 'rtl';
      const startX = isRtl ? -120 : 120;
      gsap.fromTo(toastRef.current,
        { x: startX, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
      );
    }

    const timer = setTimeout(() => {
      handleDismiss();
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast.id, handleDismiss]);

  const iconMap = {
    success: (
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    )
  };

  return (
    <div 
      ref={toastRef} 
      className={`toast-message ${toast.type || 'success'}`}
      onClick={handleDismiss}
      style={{ cursor: 'pointer' }}
    >
      <span className="toast-icon" style={{ display: 'flex', alignItems: 'center' }}>
        {iconMap[toast.type] || (
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        )}
      </span>
      <span className="toast-text">{toast.message}</span>
    </div>
  );
}
