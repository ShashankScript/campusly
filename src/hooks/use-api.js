
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useResources({ type, search } = {}) {
    return useQuery({
        queryKey: ['resources', { type, search }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (type && type !== 'all') params.append('type', type);
            if (search) params.append('search', search);

            const res = await fetch(`/api/resources?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch resources');
            return res.json();
        }
    });
}

export function useCreateResource() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newResource) => {
            const res = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newResource),
            });
            if (!res.ok) {
                const error = await res.json();
                throw error;
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
        },
    });
}

export function useBookings({ resourceId, start, end } = {}) {
    return useQuery({
        queryKey: ['bookings', { resourceId, start, end }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (resourceId) params.append('resourceId', resourceId);
            if (start) params.append('start', start);
            if (end) params.append('end', end);

            const res = await fetch(`/api/bookings?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch bookings');
            return res.json();
        },
        enabled: !!resourceId || (!!start && !!end),
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (bookingData) => {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });
            if (!res.ok) {
                const error = await res.json();
                throw error; // Throw detailed error from API
            }
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            // Also invalidate utilization if needed
            queryClient.invalidateQueries({ queryKey: ['utilization'] });
        },
    });
}

export function useUtilizationStats() {
    return useQuery({
        queryKey: ['utilization'],
        queryFn: async () => {
            const res = await fetch('/api/reports/utilization');
            if (!res.ok) throw new Error('Failed to fetch utilization stats');
            return res.json();
        }
    });
}
