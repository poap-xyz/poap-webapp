import { useState, useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

export function useToggleState(initial: boolean): [boolean, () => void] {
  const [value, setValue] = useState(initial);

  return [value, () => setValue(!value)];
}

export function useBodyClassName(classes: string) {
  return useEffect(() => {
    const oldClasses = document.body.className;
    document.body.className = classes;

    return () => {
      document.body.className = oldClasses;
    };
  }, [classes]);
}

export function useAsync<A>(fn: (params?: any) => Promise<A> | null): [A | null, boolean, boolean] {
  const [working, setWorking] = useState(false);
  const [hasError, setError] = useState(false);
  const [value, setValue] = useState<A | null>(null);

  // lib hooks
  const { addToast } = useToasts();

  useEffect(() => {
    const aux = async () => {
      setError(false);
      setWorking(true);
      try {
        const value = await fn();
        setValue(value);
      } catch (error) {
        setError(true);
        addToast(error.message, {
          appearance: 'error',
          autoDismiss: true,
        });
      } finally {
        setWorking(false);
      }
    };
    aux();
  }, [fn]); //eslint-disable-line

  return [value, working, hasError];
}
