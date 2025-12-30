import { create } from 'zustand'
import { simpleAuthClient } from '@/lib/simple-auth-client'

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  // Initialize auth state using simple auth only
  initializeAuth: async () => {
    set({ isLoading: true })
    try {
      console.log('Initializing auth with simple auth...')
      const session = await simpleAuthClient.getSession()
      console.log('Simple Auth session:', session)
      
      if (session?.user) {
        console.log('User authenticated:', session.user)
        set({ 
          user: session.user, 
          isAuthenticated: true,
          isLoading: false 
        })
      } else {
        console.log('No user session found')
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        })
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      })
    }
  },
  
  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const result = await simpleAuthClient.signIn({
        email: credentials.email,
        password: credentials.password,
      })
      
      if (result?.data?.user) {
        set({ 
          user: result.data.user, 
          isAuthenticated: true,
          isLoading: false 
        })
        return { success: true, user: result.data.user }
      } else {
        set({ isLoading: false })
        return { success: false, error: result?.error?.message || 'Login failed' }
      }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message || 'Login failed' }
    }
  },
  
  register: async (userData) => {
    set({ isLoading: true })
    try {
      const result = await simpleAuthClient.signUp({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: userData.role,
      })
      
      if (result?.data?.user) {
        set({ 
          user: result.data.user, 
          isAuthenticated: true,
          isLoading: false 
        })
        return { success: true, user: result.data.user }
      } else {
        set({ isLoading: false })
        return { success: false, error: result?.error?.message || 'Registration failed' }
      }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message || 'Registration failed' }
    }
  },
  
  logout: async () => {
    set({ isLoading: true })
    try {
      await simpleAuthClient.signOut()
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout even if API call fails
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      })
    }
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
    }))