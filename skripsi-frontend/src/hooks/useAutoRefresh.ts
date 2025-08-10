import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  queryKeys: string[][];
  interval?: number; // in milliseconds
  onFocus?: boolean;
  onReconnect?: boolean;
}

export function useAutoRefresh({
  queryKeys,
  interval = 30000, // Default: 30 seconds
  onFocus = true,
  onReconnect = true,
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Function to refetch data
    const refetchData = () => {
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    };

    // Set up interval polling
    let intervalId: NodeJS.Timeout | null = null;
    if (interval > 0) {
      intervalId = setInterval(refetchData, interval);
    }

    // Handle window focus
    const handleFocus = () => {
      if (onFocus && document.visibilityState === 'visible') {
        refetchData();
      }
    };

    // Handle reconnection
    const handleOnline = () => {
      if (onReconnect && navigator.onLine) {
        refetchData();
      }
    };

    // Add event listeners
    if (onFocus) {
      document.addEventListener('visibilitychange', handleFocus);
      window.addEventListener('focus', handleFocus);
    }
    
    if (onReconnect) {
      window.addEventListener('online', handleOnline);
    }

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      if (onFocus) {
        document.removeEventListener('visibilitychange', handleFocus);
        window.removeEventListener('focus', handleFocus);
      }
      
      if (onReconnect) {
        window.removeEventListener('online', handleOnline);
      }
    };
  }, [queryKeys, interval, onFocus, onReconnect, queryClient]);
}

// Hook specifically for containers
export function useContainerAutoRefresh() {
  useAutoRefresh({
    queryKeys: [['userContainers'], ['allContainers']],
    interval: 15000, // Refresh every 15 seconds
    onFocus: true,
    onReconnect: true,
  });
}
