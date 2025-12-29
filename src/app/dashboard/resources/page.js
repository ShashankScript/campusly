"use client"

import { ResourceList } from "@/components/dashboard/resource-list"
import { useResourceStore } from "@/store/resource-store"

export default function ResourcesPage() {
    const { setEditingResource, setShowResourceForm } = useResourceStore()

    const handleEditResource = (resource, type) => {
        setEditingResource({ ...resource, type })
        setShowResourceForm(true)
    }

    return <ResourceList onEditResource={handleEditResource} />
}
