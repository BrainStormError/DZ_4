'use client';

import { useCallback, useState } from 'react';

export interface AsyncActionOptions<TResult> {
  onSuccess?: (data: TResult) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface AsyncActionState<TResult> {
  data: TResult | undefined;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
}

export function useAsyncAction<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  options?: AsyncActionOptions<TResult>
) {
  const [state, setState] = useState<AsyncActionState<TResult>>({
    data: undefined,
    error: null,
    isLoading: false,
    isSuccess: false,
  });

  const mutate = useCallback(
    async (args: TArgs): Promise<TResult> => {
      setState((s) => ({ ...s, isLoading: true, error: null, isSuccess: false }));
      try {
        const data = await mutationFn(args);
        setState({ data, error: null, isLoading: false, isSuccess: true });
        options?.onSuccess?.(data);
        options?.onSettled?.();
        return data;
      } catch (error) {
        setState({ data: undefined, error: error as Error, isLoading: false, isSuccess: false });
        options?.onError?.(error as Error);
        options?.onSettled?.();
        throw error;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: undefined, error: null, isLoading: false, isSuccess: false });
  }, []);

  return {
    mutate,
    mutateAsync: mutate,
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    isError: state.error !== null,
    reset,
  };
}
