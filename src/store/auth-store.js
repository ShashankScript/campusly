import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (userData) => {
        set({ 
          user: userData, 
          isAuthenticated: true,
          isLoading: false 
        })
      },
      
      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        })
        // Clear all localStorage data on logout
        localStorage.removeItem('campus-resources')
        localStorage.removeItem('campus-bookings')
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading })
      },
      
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } })
      },

      // Role-based permission checks
      hasPermission: (action) => {
        const user = get().user
        if (!user) return false

        const permissions = {
          admin: [
            'view_all_resources',
            'create_resource',
            'edit_resource', 
            'delete_resource',
            'view_all_bookings',
            'create_booking',
            'edit_booking',
            'delete_booking',
            'view_analytics',
            'manage_users',
            'resolve_conflicts'
          ],
          faculty: [
            'view_all_resources',
            'create_resource',
            'edit_own_resource',
            'view_all_bookings',
            'create_booking',
            'edit_own_booking',
            'delete_own_booking',
            'view_analytics'
          ],
          student: [
            'view_available_resources',
            'create_booking',
            'edit_own_booking',
            'delete_own_booking',
            'view_own_bookings'
          ]
        }

        return permissions[user.role]?.includes(action) || false
      },

      canManageResource: (resource) => {
        const user = get().user
        if (!user) return false
        
        if (user.role === 'admin') return true
        if (user.role === 'faculty' && resource.createdBy === user.id) return true
        return false
      },

      canManageBooking: (booking) => {
        const user = get().user
        if (!user) return false
        
        if (user.role === 'admin') return true
        if (booking.bookedById === user.id) return true
        return false
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)