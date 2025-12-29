"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Monitor,
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { useResourceStore } from "@/store/resource-store"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

const bookingSchema = z.object({
  resourceId: z.string().min(1, "Please select a resource"),
  date: z.date({
    required_error: "Please select a date",
  }),
  startTime: z.string().min(1, "Please select start time"),
  endTime: z.string().min(1, "Please select end time"),
  purpose: z.string().min(5, "Please provide a purpose (minimum 5 characters)"),
  attendees: z.number().min(1, "Number of attendees must be at least 1"),
  notes: z.string().optional()
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}`)
  const end = new Date(`2000-01-01T${data.endTime}`)
  return end > start
}, {
  message: "End time must be after start time",
  path: ["endTime"]
})

export function BookingForm({ open, onClose, editingBooking = null }) {
  const [selectedResource, setSelectedResource] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState("rooms")
  const [searchTerm, setSearchTerm] = useState("")
  const [conflicts, setConflicts] = useState([])
  const [currentStep, setCurrentStep] = useState(1)

  const { user } = useAuthStore()
  const {
    rooms,
    equipment,
    books,
    faculty,
    addBooking,
    updateBooking,
    getBookingConflicts,
    selectedStartTime,
    selectedEndTime,
    selectedDate: storedDate,
  } = useResourceStore()

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      resourceId: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      purpose: "",
      attendees: 1,
      notes: ""
    }
  })

  // Consolidated initialization logic
  useEffect(() => {
    if (open) {
      if (editingBooking) {
        form.reset({
          resourceId: editingBooking.resourceId,
          date: new Date(editingBooking.date),
          startTime: editingBooking.startTime,
          endTime: editingBooking.endTime,
          purpose: editingBooking.purpose,
          attendees: editingBooking.attendees,
          notes: editingBooking.notes || ""
        })
        setSelectedDate(new Date(editingBooking.date))

        const allResources = [
          ...rooms.map(r => ({ ...r, type: 'rooms' })),
          ...equipment.map(e => ({ ...e, type: 'equipment' })),
          ...books.map(b => ({ ...b, type: 'books' })),
          ...faculty.map(f => ({ ...f, type: 'faculty' }))
        ]
        const resource = allResources.find(r => r.id === editingBooking.resourceId)
        if (resource) {
          setSelectedResource(resource)
          setActiveTab(resource.type)
          setCurrentStep(2)
        }
      } else {
        // New booking - use store values if available
        form.reset({
          resourceId: "",
          date: storedDate ? new Date(storedDate) : new Date(),
          startTime: selectedStartTime || "",
          endTime: selectedEndTime || "",
          purpose: "",
          attendees: 1,
          notes: ""
        })
        setSelectedDate(storedDate ? new Date(storedDate) : new Date())
        setSelectedResource(null)
        setCurrentStep(selectedStartTime ? 1 : 1) // Keep step 1, but user might have clicked calendar
      }
      setConflicts([])
    }
  }, [open, editingBooking, rooms, equipment, books, faculty, storedDate, selectedStartTime, selectedEndTime, form])

  const watchedValues = form.watch()

  const isStepCompleted = (step) => {
    switch (step) {
      case 1: return selectedResource !== null
      case 2:
        return !!(
          watchedValues.date &&
          watchedValues.startTime &&
          watchedValues.endTime &&
          watchedValues.purpose?.length >= 5 &&
          watchedValues.attendees >= 1
        )
      case 3: return false
      default: return false
    }
  }

  const steps = [
    { id: 1, title: "Resource", icon: Search },
    { id: 2, title: "Details", icon: CalendarIcon },
    { id: 3, title: "Confirm", icon: CheckCircle },
  ]

  const onSubmit = async (data) => {
    try {
      const bookingData = {
        ...data,
        date: data.date.toISOString().split('T')[0],
        resourceName: selectedResource.name,
        resourceType: selectedResource.type.slice(0, -1)
      }

      const hasConflicts = getBookingConflicts(bookingData, editingBooking?.id)
      if (hasConflicts.length > 0) {
        setConflicts(hasConflicts)
        setCurrentStep(3)
        toast.error("Conflicts detected!")
        return
      }

      if (editingBooking) {
        updateBooking(editingBooking.id, { ...bookingData, bookedBy: user.name, bookedById: user.id })
        toast.success("Updated!")
      } else {
        addBooking({ ...bookingData, bookedBy: user.name, bookedById: user.id })
        toast.success("Created!")
      }
      onClose()
    } catch (e) {
      toast.error("Error saving booking")
    }
  }

  const handleResourceSelect = (resource) => {
    setSelectedResource(resource)
    form.setValue("resourceId", resource.id)
    setCurrentStep(2)
  }

  const getFilteredResourcesByType = (type) => {
    const resourceMap = { rooms, equipment, books, faculty }
    const resources = resourceMap[type] || []

    return resources.filter(resource =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.location && resource.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (resource.department && resource.department.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl! w-[95vw] p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{editingBooking ? 'Edit Booking' : 'New Booking'}</DialogTitle>
          <DialogDescription>Fill in the details to reserve a campus resource.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-[600px] md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase italic">Booking</h2>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Reserve a Resource</p>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Step {currentStep}/3</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{Math.round((currentStep / 3) * 100)}% Complete</span>
                </div>
                <Progress value={(currentStep / 3) * 100} className="h-1.5 bg-zinc-200 dark:bg-zinc-800" />
              </div>

              <div className="space-y-4">
                {steps.map((s) => {
                  const completed = isStepCompleted(s.id)
                  const isCurrent = currentStep === s.id
                  const isDisabled = s.id > currentStep && !isStepCompleted(s.id - 1)

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => !isDisabled && setCurrentStep(s.id)}
                      disabled={isDisabled}
                      className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all text-left relative group ${isCurrent
                        ? 'bg-white dark:bg-zinc-800 shadow-xl shadow-blue-500/10 border border-zinc-200 dark:border-zinc-700 active:scale-[0.98]'
                        : completed && s.id < currentStep
                          ? 'opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                          : 'opacity-40 grayscale pointer-events-none'
                        }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-all duration-300 ${isCurrent
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 rotate-3'
                        : completed && s.id < currentStep
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                        {completed && s.id < currentStep ? <CheckCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500'}`}>Step 0{s.id}</span>
                        <span className={`text-sm font-bold tracking-tight ${isCurrent ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}>{s.title}</span>
                      </div>

                      {isCurrent && (
                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Help</p>
                <p className="text-xs text-blue-900/60 dark:text-blue-300/60 leading-relaxed font-medium text-balance">Ensure your selected time doesn't conflict with existing bookings.</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
            <div className="flex-1 overflow-auto p-8">
              <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)}>
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Select Resource</h3>
                      <div className="relative w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <Input
                          placeholder="Search..."
                          className="pl-9 h-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid grid-cols-4 w-full h-11 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
                        {['rooms', 'equipment', 'books', 'faculty'].map(t => (
                          <TabsTrigger key={t} value={t} className="rounded-lg text-xs font-bold uppercase tracking-wider">{t}</TabsTrigger>
                        ))}
                      </TabsList>
                      <div className="mt-6 grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-2">
                        {getFilteredResourcesByType(activeTab).map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleResourceSelect({ ...r, type: activeTab })}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group flex items-center justify-between text-left w-full ${selectedResource?.id === r.id
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                              : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 bg-zinc-50/30 dark:bg-zinc-900/30'
                              }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-xl transition-colors ${selectedResource?.id === r.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700'}`}>
                                {activeTab === 'rooms' && <MapPin className="h-5 w-5" />}
                                {activeTab === 'equipment' && <Monitor className="h-5 w-5" />}
                                {activeTab === 'books' && <BookOpen className="h-5 w-5" />}
                                {activeTab === 'faculty' && <Users className="h-5 w-5" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 break-words">{r.name}</h4>
                                <p className="text-xs text-zinc-500 font-medium">{r.location || r.department || r.author}</p>
                              </div>
                            </div>
                            {selectedResource?.id === r.id && <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </Tabs>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Booking Details</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Selected Resource</Label>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedResource?.name}</p>
                          <p className="text-xs text-zinc-500 font-medium">{selectedResource?.location || selectedResource?.department}</p>
                        </div>

                        <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 p-4 pb-0 block">Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={d => {
                              if (d) {
                                setSelectedDate(d);
                                form.setValue("date", d, { shouldValidate: true });
                              }
                            }}
                            className="p-3"
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Start Time</Label>
                            <Input type="time" {...form.register("startTime")} className="rounded-xl h-11" />
                          </div>
                          <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">End Time</Label>
                            <Input type="time" {...form.register("endTime")} className="rounded-xl h-11" />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Purpose</Label>
                          <Input placeholder="e.g. Lab work, Meeting..." {...form.register("purpose")} className={`rounded-xl h-11 ${form.formState.errors.purpose ? 'border-red-500 bg-red-50/50' : ''}`} />
                          {form.formState.errors.purpose && (
                            <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">{form.formState.errors.purpose.message}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Attendees</Label>
                          <Input type="number" {...form.register("attendees", { valueAsNumber: true })} className={`rounded-xl h-11 ${form.formState.errors.attendees ? 'border-red-500 bg-red-50/50' : ''}`} />
                          {form.formState.errors.attendees && (
                            <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-widest">{form.formState.errors.attendees.message}</p>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Notes</Label>
                          <Textarea placeholder="Any extra details..." {...form.register("notes")} className="rounded-xl min-h-[100px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Review Booking</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Summary</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-zinc-400">Resource</p>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedResource?.name}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-zinc-400">Date & Time</p>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedDate.toLocaleDateString()} at {form.getValues('startTime')} - {form.getValues('endTime')}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-zinc-400">Purpose</p>
                              <p className="font-bold text-zinc-900 dark:text-zinc-100">{form.getValues('purpose')}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center items-center p-8 bg-blue-600 rounded-3xl text-white text-center space-y-4">
                        <CheckCircle className="h-16 w-16 opacity-50" />
                        <div>
                          <h4 className="text-xl font-black tracking-tight">Ready to Confirm?</h4>
                          <p className="text-blue-100 text-sm font-medium mt-1">Review all details before submitting.</p>
                        </div>
                      </div>
                    </div>

                    {conflicts.length > 0 && (
                      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Conflicts Detected</p>
                          <ul className="mt-1 space-y-1">
                            {conflicts.map((c, i) => <li key={i} className="text-xs text-red-800 dark:text-red-300 font-medium">{c.message}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Footer Navigation */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <Button
                variant="ghost"
                type="button"
                onClick={currentStep === 1 ? onClose : () => setCurrentStep(currentStep - 1)}
                className="font-bold text-sm h-11 px-6 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepCompleted(currentStep)}
                  className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:opacity-90 font-bold h-11 px-8 rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={form.formState.isSubmitting}
                  className="bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl px-10 hover:bg-blue-700 h-10 shadow-xl shadow-blue-600/20"
                >
                  {form.formState.isSubmitting ? "Processing..." : "Confirm Booking"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}