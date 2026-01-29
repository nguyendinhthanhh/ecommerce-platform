import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for managing API data fetching with loading states
 * Provides automatic caching, error handling, and loading management
 */
export function useFetch(fetchFn, options = {}) {
  const {
    immediate = true, // Fetch immediately on mount
    dependencies = [], // Dependencies to trigger refetch
    initialData = null, // Initial data value
    onSuccess = null, // Callback on successful fetch
    onError = null, // Callback on error
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchFn(...args);

        if (mountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
          onError?.(err);
        }
        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchFn, onSuccess, onError],
  );

  // Auto-fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(
    (...args) => {
      return execute(...args);
    },
    [execute],
  );

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
}

/**
 * Custom hook for managing multiple loading states
 */
export function useLoadingStates(initialStates = {}) {
  const [states, setStates] = useState(initialStates);

  const setLoading = useCallback((key, value) => {
    setStates((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isAnyLoading = Object.values(states).some(Boolean);
  const isAllLoading = Object.values(states).every(Boolean);

  return {
    states,
    setLoading,
    isAnyLoading,
    isAllLoading,
  };
}

/**
 * Custom hook for debounced search with loading state
 */
export function useDebouncedSearch(searchFn, delay = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const search = useCallback(
    (searchQuery) => {
      setQuery(searchQuery);
      setLoading(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        try {
          const data = await searchFn(searchQuery);
          setResults(data);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, delay);
    },
    [searchFn, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    search,
    setQuery,
  };
}

/**
 * Hook for parallel data fetching
 * Useful when you need to load multiple data sources simultaneously
 */
export function useParallelFetch(fetchFunctions) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const execute = useCallback(async () => {
    const keys = Object.keys(fetchFunctions);

    // Set all to loading
    setLoading(keys.reduce((acc, key) => ({ ...acc, [key]: true }), {}));

    // Execute all fetches in parallel
    const results = await Promise.allSettled(
      keys.map(async (key) => {
        const result = await fetchFunctions[key]();
        return { key, result };
      }),
    );

    // Process results
    const newData = {};
    const newErrors = {};
    const newLoading = {};

    results.forEach((result, index) => {
      const key = keys[index];
      newLoading[key] = false;

      if (result.status === "fulfilled") {
        newData[key] = result.value.result;
      } else {
        newErrors[key] = result.reason;
      }
    });

    setData(newData);
    setErrors(newErrors);
    setLoading(newLoading);

    return newData;
  }, [fetchFunctions]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const keys = Object.keys(fetchFunctions);

      // Set all to loading
      if (isMounted) {
        setLoading(keys.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      }

      // Execute all fetches in parallel
      const results = await Promise.allSettled(
        keys.map(async (key) => {
          const result = await fetchFunctions[key]();
          return { key, result };
        }),
      );

      // Process results
      if (isMounted) {
        const newData = {};
        const newErrors = {};
        const newLoading = {};

        results.forEach((result, index) => {
          const key = keys[index];
          newLoading[key] = false;

          if (result.status === "fulfilled") {
            newData[key] = result.value.result;
          } else {
            newErrors[key] = result.reason;
          }
        });

        setData(newData);
        setErrors(newErrors);
        setLoading(newLoading);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.keys(errors).length > 0;

  return {
    data,
    loading,
    errors,
    isLoading,
    hasErrors,
    refetch: execute,
  };
}

export default useFetch;
