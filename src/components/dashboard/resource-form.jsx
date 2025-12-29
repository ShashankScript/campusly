"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useResourceStore } from "@/store/resource-store"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

const roomSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  location: z.string().min(2, "Location is required"),
  department: z.string().min(2, "Department is required"),
  equipment: z.string().optional(),
  notes: z.string().optional()
})

const equipmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string().min(2, "Type is required"),
  location: z.string().min(2, "Location is required"),
  department: z.string().min(2, "Department is required"),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  notes: z.string().optional()
})

const bookSchema = z.object({
  name: z.string().min(2, "Title must be at least 2 characters"),
  author: z.string().min(2, "Author is required"),
  isbn: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  department: z.string().min(2, "Department is required"),
  copies: z.number().min(1, "Must have at least 1 copy"),
  notes: z.string().optional()
})

const facultySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Valid email is required"),
  office: z.string().min(2, "Office location is required"),
  specialization: z.string().optional(),
  notes: z.string().optional()
})

export function ResourceForm({ open, onClose, editingResource = null }) {
  const [activeTab, setActiveTab] = useState("rooms")
  const { addResource, updateResource } = useResourceStore()
  const { user } = useAuthStore()

  const commonProps = {
    onClose,
    editingResource,
    user,
    addResource,
    updateResource
  }

  // Effect to sync tab with editing resource type
  useEffect(() => {
    if (editingResource) {
      setActiveTab(editingResource.type)
    }
  }, [editingResource])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl! w-[95vw] p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{editingResource ? 'Edit Resource' : 'Register New Resource'}</DialogTitle>
          <DialogDescription>Add or update institution resources like rooms, equipment, books, or faculty members.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center">
              {editingResource ? 'Edit Resource' : 'Register New Resource'}
            </h2>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Management Console</p>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => !editingResource && setActiveTab(val)} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid grid-cols-4 w-full h-11 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1">
                {[
                  { id: 'rooms', label: 'Room' },
                  { id: 'equipment', label: 'Equipment' },
                  { id: 'books', label: 'Book' },
                  { id: 'faculty', label: 'Faculty' }
                ].map(t => (
                  <TabsTrigger
                    key={t.id}
                    value={t.id}
                    disabled={editingResource && editingResource.type !== t.id}
                    className="rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="rooms" className="mt-0">
                <RoomFormInternal {...commonProps} />
              </TabsContent>
              <TabsContent value="equipment" className="mt-0">
                <EquipmentFormInternal {...commonProps} />
              </TabsContent>
              <TabsContent value="books" className="mt-0">
                <BookFormInternal {...commonProps} />
              </TabsContent>
              <TabsContent value="faculty" className="mt-0">
                <FacultyFormInternal {...commonProps} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RoomFormInternal({ onClose, editingResource, user, addResource, updateResource }) {
  const form = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: { name: "", capacity: 1, location: "", department: "", equipment: "", notes: "" }
  })

  useEffect(() => {
    if (editingResource && editingResource.type === 'rooms') {
      form.reset({
        name: editingResource.name,
        capacity: editingResource.capacity,
        location: editingResource.location,
        department: editingResource.department,
        equipment: editingResource.equipment?.join(', ') || "",
        notes: editingResource.notes || ""
      })
    }
  }, [editingResource, form])

  const onSubmit = (data) => {
    const resourceData = { ...data, equipment: data.equipment ? data.equipment.split(',').map(i => i.trim()) : [], createdBy: user.id }
    editingResource ? updateResource('rooms', editingResource.id, resourceData) : addResource('rooms', resourceData)
    toast.success(editingResource ? "Room updated!" : "Room added!")
    onClose()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Room Name" id="name" placeholder="Physics Lab 101" form={form} />
        <FormInput label="Capacity" id="capacity" type="number" form={form} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Location" id="location" placeholder="Science Building" form={form} />
        <FormInput label="Department" id="department" placeholder="Physics" form={form} />
      </div>
      <FormInput label="Equipment (comma-separated)" id="equipment" placeholder="Projector, Whiteboard..." form={form} />
      <FormTextarea label="Notes" id="notes" form={form} />
      <FormFooter onClose={onClose} label={editingResource ? "Update Room" : "Add Room"} />
    </form>
  )
}

function EquipmentFormInternal({ onClose, editingResource, user, addResource, updateResource }) {
  const form = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: { name: "", type: "", location: "", department: "", condition: "excellent", notes: "" }
  })

  useEffect(() => {
    if (editingResource && editingResource.type === 'equipment') {
      form.reset({
        name: editingResource.name,
        type: editingResource.type_name || editingResource.type, // avoid clash with resource.type
        location: editingResource.location,
        department: editingResource.department,
        condition: editingResource.condition,
        notes: editingResource.notes || ""
      })
    }
  }, [editingResource, form])

  const onSubmit = (data) => {
    const resourceData = { ...data, createdBy: user.id, lastMaintenance: new Date().toISOString().split('T')[0] }
    editingResource ? updateResource('equipment', editingResource.id, resourceData) : addResource('equipment', resourceData)
    toast.success("Done!")
    onClose()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Equipment Name" id="name" form={form} />
        <FormInput label="Type" id="type" form={form} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Location" id="location" form={form} />
        <FormInput label="Department" id="department" form={form} />
      </div>
      <div>
        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Condition</Label>
        <select {...form.register("condition")} className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm">
          {['excellent', 'good', 'fair', 'poor'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      <FormTextarea label="Notes" id="notes" form={form} />
      <FormFooter onClose={onClose} label={editingResource ? "Update Equipment" : "Add Equipment"} />
    </form>
  )
}

function BookFormInternal({ onClose, editingResource, user, addResource, updateResource }) {
  const form = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: { name: "", author: "", isbn: "", location: "", department: "", copies: 1, notes: "" }
  })

  useEffect(() => {
    if (editingResource && editingResource.type === 'books') {
      form.reset({
        name: editingResource.name,
        author: editingResource.author,
        isbn: editingResource.isbn || "",
        location: editingResource.location,
        department: editingResource.department,
        copies: editingResource.copies,
        notes: editingResource.notes || ""
      })
    }
  }, [editingResource, form])

  const onSubmit = (data) => {
    editingResource ? updateResource('books', editingResource.id, { ...data, createdBy: user.id }) : addResource('books', { ...data, borrowed: 0, createdBy: user.id })
    toast.success("Done!")
    onClose()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Book Title" id="name" form={form} />
        <FormInput label="Author" id="author" form={form} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="ISBN" id="isbn" form={form} />
        <FormInput label="Copies" id="copies" type="number" form={form} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Location" id="location" form={form} />
        <FormInput label="Department" id="department" form={form} />
      </div>
      <FormTextarea label="Notes" id="notes" form={form} />
      <FormFooter onClose={onClose} label={editingResource ? "Update Book" : "Add Book"} />
    </form>
  )
}

function FacultyFormInternal({ onClose, editingResource, user, addResource, updateResource }) {
  const form = useForm({
    resolver: zodResolver(facultySchema),
    defaultValues: { name: "", department: "", email: "", office: "", specialization: "", notes: "" }
  })

  useEffect(() => {
    if (editingResource && editingResource.type === 'faculty') {
      form.reset({
        name: editingResource.name,
        department: editingResource.department,
        email: editingResource.email,
        office: editingResource.office,
        specialization: editingResource.specialization || "",
        notes: editingResource.notes || ""
      })
    }
  }, [editingResource, form])

  const onSubmit = (data) => {
    editingResource ? updateResource('faculty', editingResource.id, { ...data, createdBy: user.id }) : addResource('faculty', { ...data, createdBy: user.id })
    toast.success("Done!")
    onClose()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Full Name" id="name" form={form} />
        <FormInput label="Email" id="email" type="email" form={form} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput label="Department" id="department" form={form} />
        <FormInput label="Office" id="office" form={form} />
      </div>
      <FormInput label="Specialization" id="specialization" form={form} />
      <FormTextarea label="Notes" id="notes" form={form} />
      <FormFooter onClose={onClose} label={editingResource ? "Update Faculty" : "Add Faculty"} />
    </form>
  )
}

function FormInput({ label, id, type = "text", placeholder, form }) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} {...form.register(id, { valueAsNumber: type === 'number' })} className="rounded-xl h-11" />
      {form.formState.errors[id] && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase tracking-tighter">{form.formState.errors[id].message}</p>}
    </div>
  )
}

function FormTextarea({ label, id, placeholder, form }) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">{label}</Label>
      <Textarea id={id} placeholder={placeholder} {...form.register(id)} className="rounded-xl min-h-[80px]" />
    </div>
  )
}

function FormFooter({ onClose, label }) {
  return (
    <div className="flex justify-end space-x-3 pt-2">
      <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-sm h-11 px-6 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</Button>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-blue-500/20 transition-transform active:scale-95">{label}</Button>
    </div>
  )
}