'use client';

import { useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer: ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const reduce = useReducedMotion();
  useFocusTrap(ref, open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.15 }}>
          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            className="relative w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-lift"
            initial={{ y: reduce ? 0 : 12, scale: reduce ? 1 : 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: reduce ? 0 : 8, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
          >
            <h2 id={titleId} className="text-xl font-semibold">{title}</h2>
            {description && <p id={descId} className="mt-2 text-sm text-muted">{description}</p>}
            {children}
            <div className="mt-6 flex justify-end gap-3">{footer}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
