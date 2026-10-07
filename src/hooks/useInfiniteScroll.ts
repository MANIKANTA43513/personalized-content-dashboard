import { useEffect, useRef } from 'react';

/** Calls `onIntersect` when the returned sentinel ref nears the viewport. */
export function useInfiniteScroll<T extends Element>(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<T | null>(null);
  const cb = useRef(onIntersect);
  cb.current = onIntersect;

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && cb.current(), { rootMargin: '400px 0px' });
    io.observe(node);
    return () => io.disconnect();
  }, [enabled]);

  return ref;
}
