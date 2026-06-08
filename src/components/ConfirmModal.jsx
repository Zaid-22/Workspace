import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ConfirmModal({ isOpen, onClose, title, message, onConfirm, language }) {
  const dialogRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      if (wrapperRef.current) {
        gsap.fromTo(wrapperRef.current,
          { scale: 0.92, opacity: 0, y: 15 },
          { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)', clearProps: 'all' }
        );
      }
    } else {
      if (dialog.open) {
        if (wrapperRef.current) {
          gsap.to(wrapperRef.current, {
            scale: 0.92,
            opacity: 0,
            y: 15,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => {
              dialog.close();
            }
          });
        } else {
          dialog.close();
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };

    const handleClickOutside = (e) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('click', handleClickOutside);

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleConfirmClick = () => {
    onConfirm();
    onClose();
  };

  return (
    <dialog ref={dialogRef} className="custom-modal confirm-modal" aria-labelledby="confirm-title">
      <div ref={wrapperRef} className="modal-content-wrapper">
        <div className="modal-header">
          <h3 id="confirm-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn-timer btn-timer-secondary" onClick={onClose}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button className="btn-timer btn-timer-primary" style={{ backgroundColor: 'var(--priority-high)' }} onClick={handleConfirmClick}>
            {language === 'ar' ? 'تأكيد' : 'Confirm'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
