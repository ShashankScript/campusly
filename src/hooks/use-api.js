
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';

// Helper function to make authenticated API calls
const apiCall = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for Better Auth session
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Network error' }));
    throw error;
  }
  
  return res.json();
};

export function useResources({ type, search } = {}) {
    return useQuery({
        queryKey: ['resources', { type, search }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (type && type !== 'all') params.append('type', type);
            if (search) params.append('search', search);

            return apiCall(`/api/resources?${params.toString()}`);
        }
    });
}

export function useCreateResource() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    
    return useMutation({
        mutationFn: async (newResource) => {
            return apiCall('/api/resources', {
                method: 'POST',
                body: JSON.stringify({
                    ...newResource,
                    createdBy: user?.id,
                }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
}

export function useBookings({ resourceId, start, end, userId } = {}) {
    const { user } = useAuthStore();
    
    return useQuery({
        queryKey: ['bookings', { resourceId, start, end, userId }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (resourceId) params.append('resourceId', resourceId);
            if (start) params.append('start', start);
            if (end) params.append('end', end);
            if (userId) params.append('userId', userId);

            return apiCall(`/api/bookings?${params.toString()}`);
        },
        enabled: !!user && (!!resourceId || (!!start && !!end) || !!userId),
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    
    return useMutation({
        mutationFn: async (bookingData) => {
            return apiCall('/api/bookings', {
                method: 'POST',
                body: JSON.stringify({
                    ...bookingData,
                    user: user?.id,
                }),
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['utilization'] });
        },
    });
}

export function useUtilizationStats() {
    const { user } = useAuthStore();
    
    return useQuery({
        queryKey: ['utilization'],
        queryFn: async () => {
            return apiCall('/api/reports/utilization');
        },
        enabled: !!user,
    });
}
