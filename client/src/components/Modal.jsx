import { useEffect, useRef } from 'react';

// Accessible-ish modal: dims the page, closes on Escape or backdrop click, locks scroll
function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  // Keep the latest onClose without re-running the effect (callers usually pass inline functions)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current?.();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  const width = size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-4 backdrop-blur-sm animate-fade-in sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`flex max-h-[85vh] w-full ${width} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-slide-up`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-2 rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stone-200 bg-stone-50 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
