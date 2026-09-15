import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsyncAction } from './useAsyncAction';

describe('useAsyncAction', () => {
  it('transitions to loading then success', async () => {
    const fn = vi.fn(async (x: number) => x * 2);
    const { result } = renderHook(() => useAsyncAction(fn));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    let promise: Promise<number> | undefined;
    act(() => {
      promise = result.current.mutate(21);
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });

  it('transitions to error', async () => {
    const fn = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useAsyncAction<undefined, never>(fn));

    await act(async () => {
      await result.current.mutate(undefined).catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error?.message).toBe('boom');
    expect(result.current.data).toBeUndefined();
  });

  it('resets state', async () => {
    const fn = vi.fn(async () => 1);
    const { result } = renderHook(() => useAsyncAction<undefined, number>(fn));

    await act(async () => {
      await result.current.mutate(undefined);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});
