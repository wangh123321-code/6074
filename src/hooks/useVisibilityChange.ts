import { useEffect } from 'react';
import { useAnatomyStore } from '../store/useAnatomyStore';

export const useVisibilityChange = () => {
  const setPaused = useAnatomyStore((state) => state.setPaused);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      setPaused(isHidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setPaused]);
};
