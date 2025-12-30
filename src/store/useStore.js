
import { create } from 'zustand';

export const useStore = create((set) => ({
    // UI State
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

    // User State (Mock for now, can be connected to Auth)
    user: null, // { _id, name, email, role }
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),

    // Filters State
    filters: {
        search: '',
        type: 'all',
    },
    setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
    })),

    // Booking Flow State
    selectedResource: null,
    setSelectedResource: (resource) => set({ selectedResource: resource }),

    isBookingModalOpen: false,
    openBookingModal: (resource) => set({ isBookingModalOpen: true, selectedResource: resource || null }),
    closeBookingModal: () => set({ isBookingModalOpen: false, selectedResource: null }),
}));
