"use client"

import { Analytics } from "@/components/dashboard/analytics"
import { useAuthStore } from "@/store/auth-store"

export default function AnalyticsPage() {
    const { hasPermission } = useAuthStore()

    if (!hasPermission('view_analytics')) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-zinc-500">You don't have permission to view analytics.</p>
            </div>
        )
    }

    return <Analytics />
}
