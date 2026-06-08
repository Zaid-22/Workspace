import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Reusable modal component utilizing the HTML5 native <dialog> element
 * Implements accessible focus management, Escape key closure, and backdrop light dismiss.
 */
export default function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // Trigger GSAP entry animation
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

  return (
    <dialog ref={dialogRef} className="custom-modal" aria-labelledby="modal-title">
      <div ref={wrapperRef} className="modal-content-wrapper">
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </dialog>
  );
}
