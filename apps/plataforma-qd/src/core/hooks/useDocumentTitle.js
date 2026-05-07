import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} | Howard OS`;
    return () => {
      document.title = 'Howard OS';
    };
  }, [title]);
}

export function DocumentTitle({ title }) {
  useDocumentTitle(title);
  return null;
}
