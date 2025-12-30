"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { BookingForm } from "@/components/dashboard/booking-form"
import { ResourceForm } from "@/components/dashboard/resource-form"
import { useResourceStore } from "@/store/resource-store"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }) {
    const {
        initializeData,
        showBookingForm,
        setShowBookingForm,
        showResourceForm,
        setShowResourceForm,
        editingResource,
        setEditingResource,
        editingBooking
    } = useResourceStore()
    const { isAuthenticated } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/")
        }
    }, [isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            initializeData(isAuthenticated)
        }
    }, [isAuthenticated, initializeData])

    const handleCloseResourceForm = () => {
        setShowResourceForm(false)
        setEditingResource(null)
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onNewBooking={() => setShowBookingForm(true)}
                    onNewResource={() => setShowResourceForm(true)}
                />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>

            {showBookingForm && (
                <BookingForm
                    open={showBookingForm}
                    onClose={() => setShowBookingForm(false)}
                    editingBooking={editingBooking}
                />
            )}

            {showResourceForm && (
                <ResourceForm
                    open={showResourceForm}
                    onClose={handleCloseResourceForm}
                    editingResource={editingResource}
                />
            )}
        </div>
    )
}
