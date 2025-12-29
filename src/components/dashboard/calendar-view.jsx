"use client"

import { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useResourceStore } from '@/store/resource-store'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookingForm } from './booking-form'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, User, Edit, Trash2, Monitor, BookOpen, Users } from 'lucide-react'

export function CalendarView() {
  const calendarRef = useRef(null)
  const {
    bookings,
    setSelectedDate,
    getDashboardStats,
    deleteBooking,
    setShowBookingForm,
    setEditingBooking
  } = useResourceStore()
  const { canManageBooking } = useAuthStore()
  const [currentView, setCurrentView] = useState('timeGridWeek')
  const [viewTitle, setViewTitle] = useState('')

  const stats = getDashboardStats()
  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.date === today)

  // Convert bookings to FullCalendar events
  const calendarEvents = bookings.map(booking => ({
    id: booking.id,
    title: booking.purpose,
    start: `${booking.date}T${booking.startTime}`,
    end: `${booking.date}T${booking.endTime}`,
    backgroundColor: getEventColor(booking.resourceType),
    borderColor: 'transparent',
    extendedProps: {
      booking: booking,
      resourceName: booking.resourceName,
      bookedBy: booking.bookedBy,
      resourceType: booking.resourceType,
    }
  }))

  function getEventColor(resourceType) {
    const colors = {
      room: '#3b82f6', // blue-500
      equipment: '#10b981', // emerald-500
      book: '#f59e0b', // amber-500
      faculty: '#8b5cf6' // violet-500
    }
    return colors[resourceType] || '#6b7280'
  }

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(new Date(selectInfo.start))

    // Extract HH:mm
    const startStr = selectInfo.start.toTimeString().slice(0, 5)
    const endStr = selectInfo.end.toTimeString().slice(0, 5)

    useResourceStore.getState().setSelectedTimeRange(startStr, endStr)
    setShowBookingForm(true)
  }

  const handleEventClick = (clickInfo) => {
    const booking = clickInfo.event.extendedProps.booking

    toast.info(
      <div className="flex flex-col space-y-1">
        <p className="font-bold">{booking.resourceName}</p>
        <p className="text-xs">{booking.purpose}</p>
        <p className="text-xs">{booking.startTime} - {booking.endTime}</p>
      </div>,
      {
        duration: 4000,
        action: canManageBooking(booking) ? {
          label: "Edit",
          onClick: () => handleEditBooking(booking)
        } : undefined
      }
    )
  }

  const handleDateClick = (arg) => {
    setSelectedDate(new Date(arg.date))
  }

  const handleEditBooking = (booking) => {
    setEditingBooking(booking)
    setShowBookingForm(true)
  }

  const handleDeleteBooking = (bookingId) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(bookingId)
      toast.success('Booking deleted successfully!')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Calendar View Container */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Calendar Card */}
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={Calendar}
              color="blue"
            />
            <StatsCard
              title="Today's Bookings"
              value={stats.todayBookings}
              icon={Clock}
              color="emerald"
            />
            <StatsCard
              title="Active Now"
              value={stats.activeBookings}
              icon={User}
              color="violet"
            />
          </div>

          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => calendarRef.current?.getApi().prev()}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold"
                    onClick={() => calendarRef.current?.getApi().today()}
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => calendarRef.current?.getApi().next()}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Button>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 min-w-[150px] text-center">
                    {viewTitle}
                  </h3>
                </div>

                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                  <ViewButton
                    label="Month"
                    active={currentView === 'dayGridMonth'}
                    onClick={() => {
                      calendarRef.current?.getApi().changeView('dayGridMonth')
                    }}
                  />
                  <ViewButton
                    label="Week"
                    active={currentView === 'timeGridWeek'}
                    onClick={() => {
                      calendarRef.current?.getApi().changeView('timeGridWeek')
                    }}
                  />
                  <ViewButton
                    label="Day"
                    active={currentView === 'timeGridDay'}
                    onClick={() => {
                      calendarRef.current?.getApi().changeView('timeGridDay')
                    }}
                  />
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-950">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  headerToolbar={false}
                  initialView="timeGridWeek"
                  editable={false}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={calendarEvents}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  datesSet={(arg) => {
                    setViewTitle(arg.view.title)
                    setCurrentView(arg.view.type)
                  }}
                  height="700px"
                  slotMinTime="07:00:00"
                  slotMaxTime="22:00:00"
                  allDaySlot={false}
                  slotDuration="00:30:00"
                  nowIndicator={true}
                  eventTimeFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: 'short'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Highlighting */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-bold flex items-center uppercase tracking-wider text-zinc-500">
                <Calendar className="h-4 w-4 mr-2" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
              {todayBookings.length > 0 ? (
                todayBookings.map(booking => (
                  <div key={booking.id} className="group relative p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all cursor-default">
                    <div className="flex items-start space-x-3">
                      <div
                        className="w-1.5 h-12 rounded-full shrink-0"
                        style={{ backgroundColor: getEventColor(booking.resourceType) }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {booking.resourceName}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-2">
                          {booking.purpose}
                        </p>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.startTime}
                          </div>
                          <div className="flex items-center text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                            <User className="h-3 w-3 mr-1" />
                            {canManageBooking(booking) ? 'You' : booking.bookedBy}
                          </div>
                        </div>
                      </div>

                      {canManageBooking(booking) && (
                        <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-white dark:hover:bg-zinc-800 shadow-sm"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 shadow-sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium">No bookings today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Resource Legend</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {[
                { label: 'Rooms', color: '#3b82f6', icon: MapPin },
                { label: 'Equipment', color: '#10b981', icon: Monitor },
                { label: 'Books', color: '#f59e0b', icon: BookOpen },
                { label: 'Faculty', color: '#8b5cf6', icon: Users }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg transition-colors group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800">
                      <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{item.label}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
    violet: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400 border-violet-100 dark:border-violet-800',
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl border ${colorMap[color] || ''}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function ViewButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${active
        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
        }`}
    >
      {label}
    </button>
  )
}