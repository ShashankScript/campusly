import { create } from 'zustand'

// Initialize with sample data if localStorage is empty
const initializeData = () => {
  const existingResources = localStorage.getItem('campus-resources')
  const existingBookings = localStorage.getItem('campus-bookings')

  if (!existingResources) {
    const sampleResources = {
      rooms: [
        {
          id: 'room-101',
          name: 'Physics Lab 101',
          capacity: 30,
          location: 'Science Building, Floor 1',
          equipment: ['Projector', 'Whiteboard', 'Lab Equipment'],
          status: 'available',
          department: 'Physics',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'room-102',
          name: 'Conference Room A',
          capacity: 12,
          location: 'Admin Building, Floor 2',
          equipment: ['Video Conference', 'Projector', 'Whiteboard'],
          status: 'available',
          department: 'Administration',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'room-103',
          name: 'Lecture Hall 1',
          capacity: 100,
          location: 'Main Building, Floor 1',
          equipment: ['Audio System', 'Projector', 'Microphone'],
          status: 'available',
          department: 'General',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      equipment: [
        {
          id: 'eq-microscope-1',
          name: 'Digital Microscope',
          type: 'Laboratory Equipment',
          location: 'Biology Lab',
          status: 'available',
          condition: 'excellent',
          lastMaintenance: '2024-12-15',
          department: 'Biology',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'eq-projector-1',
          name: 'HD Projector',
          type: 'AV Equipment',
          location: 'Equipment Room',
          status: 'available',
          condition: 'good',
          lastMaintenance: '2024-12-10',
          department: 'General',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      books: [
        {
          id: 'book-physics-1',
          name: 'Advanced Physics Textbook',
          author: 'Dr. Johnson',
          isbn: '978-0123456789',
          location: 'Library - Section A',
          status: 'available',
          copies: 5,
          borrowed: 0,
          department: 'Physics',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'book-chemistry-1',
          name: 'Organic Chemistry',
          author: 'Prof. Smith',
          isbn: '978-0987654321',
          location: 'Library - Section B',
          status: 'available',
          copies: 3,
          borrowed: 1,
          department: 'Chemistry',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      faculty: [
        {
          id: 'faculty-1',
          name: 'Dr. Sarah Johnson',
          department: 'Physics',
          email: 'sarah.johnson@university.edu',
          office: 'Science Building 201',
          status: 'available',
          specialization: 'Quantum Physics',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'faculty-2',
          name: 'Prof. Michael Smith',
          department: 'Chemistry',
          email: 'michael.smith@university.edu',
          office: 'Science Building 301',
          status: 'available',
          specialization: 'Organic Chemistry',
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        }
      ]
    }
    localStorage.setItem('campus-resources', JSON.stringify(sampleResources))
  }

  if (!existingBookings) {
    const sampleBookings = [
      {
        id: 'booking-1',
        resourceId: 'room-101',
        resourceType: 'room',
        resourceName: 'Physics Lab 101',
        date: '2024-12-29',
        startTime: '09:00',
        endTime: '11:00',
        purpose: 'Physics Lab Session',
        attendees: 25,
        bookedBy: 'Dr. Sarah Johnson',
        bookedById: 'faculty-1',
        status: 'confirmed',
        notes: 'Lab equipment required',
        createdAt: new Date().toISOString()
      },
      {
        id: 'booking-2',
        resourceId: 'eq-microscope-1',
        resourceType: 'equipment',
        resourceName: 'Digital Microscope',
        date: '2024-12-29',
        startTime: '14:00',
        endTime: '16:00',
        purpose: 'Biology Research',
        attendees: 1,
        bookedBy: 'Prof. Michael Smith',
        bookedById: 'faculty-2',
        status: 'confirmed',
        notes: 'Research project',
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('campus-bookings', JSON.stringify(sampleBookings))
  }
}

export const useResourceStore = create((set, get) => ({
  // Resources data
  rooms: [],
  equipment: [],
  books: [],
  faculty: [],

  // Bookings
  bookings: [],

  // UI state
  selectedResource: null,
  selectedDate: new Date(),
  selectedStartTime: '',
  selectedEndTime: '',

  // Form visibility state
  showBookingForm: false,
  showResourceForm: false,
  editingResource: null,
  editingBooking: null,

  // Filters
  filters: {
    resourceType: 'all',
    availability: 'all',
    department: 'all',
    search: ''
  },

  // Initialize data from localStorage
  initializeData: () => {
    initializeData()
    const resources = JSON.parse(localStorage.getItem('campus-resources') || '{}')
    const bookings = JSON.parse(localStorage.getItem('campus-bookings') || '[]')

    set({
      rooms: resources.rooms || [],
      equipment: resources.equipment || [],
      books: resources.books || [],
      faculty: resources.faculty || [],
      bookings: bookings
    })
  },

  // Save to localStorage
  saveToStorage: () => {
    const state = get()
    const resources = {
      rooms: state.rooms,
      equipment: state.equipment,
      books: state.books,
      faculty: state.faculty
    }
    localStorage.setItem('campus-resources', JSON.stringify(resources))
    localStorage.setItem('campus-bookings', JSON.stringify(state.bookings))
  },

  // Actions
  setResources: (type, data) => {
    set({ [type]: data })
    get().saveToStorage()
  },

  addResource: (type, resource) => {
    const newResource = {
      ...resource,
      id: `${type.slice(0, -1)}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'available'
    }

    set(state => ({
      [type]: [...state[type], newResource]
    }))
    get().saveToStorage()
    return newResource
  },

  updateResource: (type, id, updates) => {
    set(state => ({
      [type]: state[type].map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    }))
    get().saveToStorage()
  },

  deleteResource: (type, id) => {
    // Also delete related bookings
    set(state => ({
      [type]: state[type].filter(item => item.id !== id),
      bookings: state.bookings.filter(booking => booking.resourceId !== id)
    }))
    get().saveToStorage()
  },

  setBookings: (bookings) => {
    set({ bookings })
    get().saveToStorage()
  },

  addBooking: (booking) => {
    const newBooking = {
      ...booking,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    }

    set(state => ({
      bookings: [...state.bookings, newBooking]
    }))
    get().saveToStorage()
    return newBooking
  },

  updateBooking: (id, updates) => {
    set(state => ({
      bookings: state.bookings.map(booking =>
        booking.id === id ? { ...booking, ...updates, updatedAt: new Date().toISOString() } : booking
      )
    }))
    get().saveToStorage()
  },

  deleteBooking: (id) => {
    set(state => ({
      bookings: state.bookings.filter(booking => booking.id !== id)
    }))
    get().saveToStorage()
  },

  setSelectedResource: (resource) => {
    set({ selectedResource: resource })
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date })
  },


  setShowBookingForm: (show) => {
    set({ showBookingForm: show })
    if (!show) {
      set({
        editingBooking: null,
        selectedStartTime: '',
        selectedEndTime: ''
      })
    }
  },

  setSelectedTimeRange: (start, end) => {
    set({ selectedStartTime: start, selectedEndTime: end })
  },

  setShowResourceForm: (show) => {
    set({ showResourceForm: show })
    if (!show) set({ editingResource: null })
  },

  setEditingResource: (resource) => {
    set({ editingResource: resource })
  },

  setEditingBooking: (booking) => {
    set({ editingBooking: booking })
  },

  setFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  // Computed values
  getAvailableResources: (date, startTime, endTime, excludeBookingId = null) => {
    const state = get()
    const allResources = [
      ...state.rooms.map(r => ({ ...r, type: 'room' })),
      ...state.equipment.map(e => ({ ...e, type: 'equipment' })),
      ...state.books.map(b => ({ ...b, type: 'book' })),
      ...state.faculty.map(f => ({ ...f, type: 'faculty' }))
    ]

    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const newStartMinutes = timeToMinutes(startTime)
    const newEndMinutes = timeToMinutes(endTime)

    return allResources.filter(resource => {
      if (resource.status !== 'available') return false

      const conflictingBookings = state.bookings.filter(booking => {
        // Skip if it's the same booking (for updates)
        if (booking.id === excludeBookingId) return false

        // Must be same resource and date
        if (booking.resourceId !== resource.id || booking.date !== date) return false

        // Must be confirmed booking
        if (booking.status !== 'confirmed') return false

        // Check time overlap
        const existingStartMinutes = timeToMinutes(booking.startTime)
        const existingEndMinutes = timeToMinutes(booking.endTime)

        // Check if times overlap
        const hasOverlap = (
          (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
          (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
          (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
        )

        return hasOverlap
      })

      return conflictingBookings.length === 0
    })
  },

  getResourceUtilization: (resourceId, period = 'week') => {
    const state = get()
    const bookings = state.bookings.filter(b =>
      b.resourceId === resourceId && b.status === 'confirmed'
    )

    // Calculate utilization based on period
    const now = new Date()
    const startDate = new Date()

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    }

    const relevantBookings = bookings.filter(b =>
      new Date(b.date) >= startDate && new Date(b.date) <= now
    )

    const totalHours = relevantBookings.reduce((sum, booking) => {
      const start = new Date(`2000-01-01T${booking.startTime}`)
      const end = new Date(`2000-01-01T${booking.endTime}`)
      return sum + (end - start) / (1000 * 60 * 60)
    }, 0)

    const maxPossibleHours = period === 'week' ? 7 * 12 : 30 * 12 // Assuming 12 hours per day

    return Math.round((totalHours / maxPossibleHours) * 100)
  },

  getFilteredResources: (type) => {
    const state = get()
    const resources = state[type] || []
    const { search, department, availability } = state.filters

    return resources.filter(resource => {
      // Search filter
      if (search && !resource.name.toLowerCase().includes(search.toLowerCase()) &&
        !resource.location?.toLowerCase().includes(search.toLowerCase())) {
        return false
      }

      // Department filter
      if (department !== 'all' && resource.department !== department) {
        return false
      }

      // Availability filter
      if (availability !== 'all') {
        if (availability === 'available' && resource.status !== 'available') {
          return false
        }
        if (availability === 'booked' && resource.status === 'available') {
          return false
        }
      }

      return true
    })
  },

  getBookingConflicts: (bookingData, excludeBookingId = null) => {
    const state = get()
    const conflicts = []

    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const newStartMinutes = timeToMinutes(bookingData.startTime)
    const newEndMinutes = timeToMinutes(bookingData.endTime)

    const conflictingBookings = state.bookings.filter(booking => {
      // Skip if it's the same booking (for updates)
      if (booking.id === excludeBookingId) return false

      // Must be same resource and date
      if (booking.resourceId !== bookingData.resourceId || booking.date !== bookingData.date) return false

      // Must be confirmed booking
      if (booking.status !== 'confirmed') return false

      // Check time overlap
      const existingStartMinutes = timeToMinutes(booking.startTime)
      const existingEndMinutes = timeToMinutes(booking.endTime)

      // Check if times overlap
      const hasOverlap = (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      )

      return hasOverlap
    })

    conflictingBookings.forEach(booking => {
      conflicts.push({
        id: `conflict-${booking.id}`,
        message: `${booking.resourceName} is already booked from ${booking.startTime} - ${booking.endTime} by ${booking.bookedBy}`,
        type: 'time_conflict',
        conflictingBooking: booking
      })
    })

    return conflicts
  },

  getDashboardStats: () => {
    const state = get()
    const today = new Date().toISOString().split('T')[0]

    const totalResources = state.rooms.length + state.equipment.length + state.books.length + state.faculty.length
    const totalBookings = state.bookings.length
    const todayBookings = state.bookings.filter(b => b.date === today).length
    const activeBookings = state.bookings.filter(b => b.status === 'confirmed').length

    return {
      totalResources,
      totalBookings,
      todayBookings,
      activeBookings,
      availableRooms: state.rooms.filter(r => r.status === 'available').length,
      availableEquipment: state.equipment.filter(e => e.status === 'available').length
    }
  }
}))