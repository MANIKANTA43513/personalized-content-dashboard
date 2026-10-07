import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('emits only the final value after the delay, not every keystroke', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 400), { initialProps: { v: '' } });
    for (const v of ['r', 're', 'rea', 'reac', 'react']) {
      rerender({ v });
      act(() => { vi.advanceTimersByTime(100); });
    }
    expect(result.current).toBe('');
    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current).toBe('react');
  });

  it('clears its timer on unmount', () => {
    const spy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = renderHook(() => useDebouncedValue('x', 400));
    unmount();
    expect(spy).toHaveBeenCalled();
  });
});
