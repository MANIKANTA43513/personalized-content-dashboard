'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { announce } from '@/store/slices/uiSlice';

/** Polite live region for screen readers + a short-lived visual toast for sighted users. */
export function AnnouncementRegion() {
  const dispatch = useAppDispatch();
  const message = useAppSelector((s) => s.ui.announcement);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => dispatch(announce('')), 2600);
    return () => clearTimeout(id);
  }, [message, dispatch]);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{message}</div>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" aria-hidden="true">
        <AnimatePresence>
          {message && (
            <motion.div key={message} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="rounded-full bg-ink px-4 py-2 text-sm text-canvas shadow-lift" data-testid="toast">
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
