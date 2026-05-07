/**
 * QodeIA Shared React Hooks
 * Hooks de React compartidos para el ecosistema QodeIA
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, QodeIAAuthService, QodeIAUser } from '../auth';
import { QodeIAClient } from '../api-client';

// ============================================================================
// AUTH HOOKS
// ============================================================================

export interface UseAuthReturn {
  user: QodeIAUser | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<QodeIAUser>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<QodeIAUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        auth.getUser().then((user) => {
          setUser(user);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to auth changes
    const unsubscribe = auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session) {
        auth.getUser().then(setUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: authUser } = await auth.signIn({ email, password });
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const { user: authUser } = await auth.signUp({ email, password, displayName });
      setUser(authUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    await auth.signInWithGitHub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await auth.signInWithGoogle();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<QodeIAUser>) => {
    const updatedUser = await auth.updateProfile(updates);
    setUser(updatedUser);
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    signInWithGitHub,
    signInWithGoogle,
    updateProfile,
  };
}

// ============================================================================
// API CLIENT HOOK
// ============================================================================

export interface UseApiClientReturn {
  client: QodeIAClient | null;
  isReady: boolean;
}

export function useApiClient(): UseApiClientReturn {
  const [client, setClient] = useState<QodeIAClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    auth.getUser().then((user) => {
      if (user?.organization_id) {
        const apiClient = new QodeIAClient(user.organization_id);
        setClient(apiClient);
        setIsReady(true);
      }
    });
  }, []);

  return { client, isReady };
}

// ============================================================================
// LOCAL STORAGE HOOKS
// ============================================================================

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// ============================================================================
// MEDIA QUERIES HOOKS
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

// ============================================================================
// WINDOW SIZE HOOK
// ============================================================================

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// ============================================================================
// DEBOUNCE HOOK
// ============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (element: Element | null) => {
      if (observer.current) {
        observer.current.disconnect();
      }

      if (element) {
        observer.current = new IntersectionObserver(([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.current.observe(element);
      }
    },
    [options.root, options.rootMargin, options.threshold]
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return [ref, isIntersecting];
}

// ============================================================================
// PREVIOUS VALUE HOOK
// ============================================================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// ============================================================================
// TOGGLE HOOK
// ============================================================================

export function useToggle(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle];
}

// ============================================================================
// FETCH HOOK
// ============================================================================

export interface UseFetchReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useFetch<T>(
  url: string | null,
  options?: RequestInit
): UseFetchReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!url) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url, trigger]);

  return { data, error, isLoading, refetch };
}

// ============================================================================
// KEYBOARD SHORTCUTS HOOK
// ============================================================================

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const metaMatch = options.meta ? event.metaKey : true;
      const ctrlMatch = options.ctrl ? event.ctrlKey : true;
      const shiftMatch = options.shift ? event.shiftKey : true;
      const altMatch = options.alt ? event.altKey : true;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        metaMatch &&
        ctrlMatch &&
        shiftMatch &&
        altMatch
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options.meta, options.ctrl, options.shift, options.alt]);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const hooks = {
  useAuth,
  useApiClient,
  useLocalStorage,
  useSessionStorage,
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useWindowSize,
  useDebounce,
  useIntersectionObserver,
  usePrevious,
  useToggle,
  useFetch,
  useKeyboardShortcut,
};

export default hooks;
