'use client';

import { useCallback, useState } from 'react';

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  data: T | null;
  error: Error | null;
  status: ApiStatus;
}

export interface UseApiWithRetryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseApiWithRetryReturn<T> extends ApiState<T> {
  execute: () => Promise<void>;
  retry: () => void;
  reset: () => void;
  retryCount: number;
  isRetrying: boolean;
}

/**
 * Hook for managing API calls with retry functionality.
 * Useful for GitHub API calls that may fail due to rate limits.
 */
export function useApiWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: UseApiWithRetryOptions<T> = {},
): UseApiWithRetryReturn<T> {
  const { onSuccess, onError, maxRetries = 3, retryDelay = 1000 } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    status: 'idle',
  });

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const data = await fetchFn();
      setState({ data, error: null, status: 'success' });
      onSuccess?.(data);
      setRetryCount(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, error, status: 'error' });
      onError?.(error);
    }
  }, [fetchFn, onSuccess, onError]);

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      setRetryCount((prev) => prev + 1);

      // Exponential backoff
      const delay = retryDelay * Math.pow(2, retryCount);
      setTimeout(() => {
        execute().finally(() => setIsRetrying(false));
      }, delay);
    }
  }, [retryCount, maxRetries, retryDelay, execute]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, status: 'idle' });
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    retryCount,
    isRetrying,
  };
}

/**
 * Hook for managing fetch requests with automatic retry on failure.
 */
export function useFetchWithRetry(url: string | null, fetchOptions?: RequestInit) {
  const fetchData = async () => {
    if (!url) throw new Error('No URL provided');
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  };

  return useApiWithRetry(fetchData);
}
