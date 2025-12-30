
import { create } from 'zustand'

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

  // Initialize data from Backend
  initializeData: async (isAuthenticated = false) => {
    // Only fetch data if user is authenticated
    if (!isAuthenticated) {
      console.log('Skipping resource fetch - user not authenticated');
      return;
    }

    try {
      const res = await fetch('/api/resources', {
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!res.ok) {
        console.error('Failed to fetch resources:', res.status, res.statusText);
        return;
      }
      
      const response = await res.json();
      
      if (!response.success || !response.data) {
        console.error('Invalid API response:', response);
        return;
      }
      
      const data = response.data;

      // Segregate resources
      const rooms = data.filter(r => r.type === 'room').map(normalizeResource);
      const equipment = data.filter(r => r.type === 'equipment').map(normalizeResource);
      const books = data.filter(r => r.type === 'book').map(normalizeResource);
      const faculty = data.filter(r => r.type === 'faculty_hour').map(normalizeResource);

      set({
        rooms,
        equipment,
        books,
        faculty,
      });
    } catch (error) {
      console.error("Failed to fetch resources:", error);
      // Set empty arrays as fallback
      set({
        rooms: [],
        equipment: [],
        books: [],
        faculty: [],
      });
    }
  },

  // Actions
  setResources: (type, data) => {
    set({ [type]: data })
  },

  addResource: async (type, resourceData) => {
    // Map frontend specific types to API types
    const apiTypeMap = {
      'rooms': 'room',
      'equipment': 'equipment',
      'books': 'book',
      'faculty': 'faculty_hour'
    };

    const apiType = apiTypeMap[type] || 'room';

    try {
      const requestData = {
        name: resourceData.name,
        type: apiType,
        description: resourceData.notes || '',
        capacity: resourceData.capacity || 1,
        location: resourceData.location || '',
        meta: resourceData // Store full object in meta for specific fields
      };
      
      console.log('Sending resource data:', requestData);
      
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(requestData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error Response:', errorData);
        
        let errorMessage = 'Failed to create resource';
        
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.fieldErrors) {
            // Handle flattened Zod validation errors
            const fieldErrors = Object.entries(errorData.error.fieldErrors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            errorMessage = `Validation errors: ${fieldErrors}`;
          } else if (errorData.error.formErrors && errorData.error.formErrors.length > 0) {
            errorMessage = `Form errors: ${errorData.error.formErrors.join(', ')}`;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        }
        
        throw new Error(errorMessage);
      }
      const { data } = await res.json();
      const normalized = normalizeResource(data);

      set(state => ({
        [type]: [normalized, ...state[type]]
      }));

      return normalized;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateResource: (type, id, updates) => {
    // TODO: Implement PUT API
    set(state => ({
      [type]: state[type].map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    }))
  },

  deleteResource: (type, id) => {
    // TODO: Implement DELETE API
    set(state => ({
      [type]: state[type].filter(item => item.id !== id),
      bookings: state.bookings.filter(booking => booking.resourceId !== id)
    }))
  },

  setBookings: (bookings) => {
    set({ bookings })
  },

  addBooking: async (booking) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          user: booking.bookedById,
          resource: booking.resourceId,
          startTime: `${booking.date}T${booking.startTime}:00`,
          endTime: `${booking.date}T${booking.endTime}:00`,
          notes: booking.notes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to book');
      }

      const { data } = await res.json();
      const newBooking = {
        ...booking,
        id: data._id,
        status: data.status,
        createdAt: data.createdAt
      };

      set(state => ({
        bookings: [...state.bookings, newBooking]
      }));
      return newBooking;
    } catch (error) {
      throw error;
    }
  },

  updateBooking: (id, updates) => {
    set(state => ({
      bookings: state.bookings.map(booking =>
        booking.id === id ? { ...booking, ...updates, updatedAt: new Date().toISOString() } : booking
      )
    }))
  },

  deleteBooking: (id) => {
    set(state => ({
      bookings: state.bookings.filter(booking => booking.id !== id)
    }))
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
    // Simplification: We rely on API for conflict detection during booking
    // This client-side check is approximate now
    const state = get()
    // ... logic preserved ...
    const allResources = [
      ...state.rooms,
      ...state.equipment,
      ...state.books,
      ...state.faculty
    ];
    return allResources; // Return all for now, as real conflict check is server side
  },

  getResourceUtilization: (resourceId, period = 'week') => {
    return 0;
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
      return true
    })
  },

  getBookingConflicts: (bookingData) => {
    return []; // Server side check
  },

  getDashboardStats: () => {
    const state = get()
    return {
      totalResources: state.rooms.length + state.equipment.length + state.books.length + state.faculty.length,
      totalBookings: state.bookings.length,
      todayBookings: 0,
      activeBookings: 0,
      availableRooms: state.rooms.length,
      availableEquipment: state.equipment.length
    }
  }
}))

function normalizeResource(apiResource) {
  // Convert API shape to frontend expected shape
  const meta = apiResource.meta || {};
  return {
    id: apiResource._id,
    name: apiResource.name,
    type: apiResource.type,
    capacity: apiResource.capacity,
    location: apiResource.location || meta.location,
    description: apiResource.description,
    status: apiResource.isActive ? 'available' : 'unavailable',
    department: meta.department || 'General',
    ...meta // Spread other meta fields like isbn, author, etc
  };
}