"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useResourceStore } from "@/store/resource-store"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import {
  MapPin,
  Monitor,
  BookOpen,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"

export function ResourceList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("rooms")

  const {
    rooms,
    equipment,
    books,
    faculty,
    deleteResource,
    setShowResourceForm,
    setEditingResource
  } = useResourceStore()

  const { hasPermission, canManageResource, user } = useAuthStore()

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { variant: "secondary", color: "text-green-600", icon: CheckCircle },
      booked: { variant: "destructive", color: "text-red-600", icon: XCircle },
      busy: { variant: "destructive", color: "text-red-600", icon: XCircle },
      limited: { variant: "outline", color: "text-yellow-600", icon: Clock },
      unavailable: { variant: "destructive", color: "text-red-600", icon: XCircle }
    }

    const config = statusConfig[status] || statusConfig.available
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleDeleteResource = (type, id, resource) => {
    if (!canManageResource(resource)) {
      toast.error("You don't have permission to delete this resource.")
      return
    }

    if (confirm(`Are you sure you want to delete ${resource.name}? This will also delete all related bookings.`)) {
      deleteResource(type, id)
      toast.success("Resource deleted successfully!")
    }
  }

  const handleEditResource = (resource) => {
    if (!canManageResource(resource)) {
      toast.error("You don't have permission to edit this resource.")
      return
    }
    setEditingResource(resource)
    setShowResourceForm(true)
  }

  const getFilteredResourcesByType = (type) => {
    const resourceMap = { rooms, equipment, books, faculty }
    const resources = resourceMap[type] || []

    return resources.filter(resource => {
      // Search filter
      if (searchTerm && !resource.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !resource.location?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !resource.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Role-based filtering for students
      if (user?.role === 'student' && resource.status !== 'available') {
        return false
      }

      return true
    })
  }

  const renderRoomsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room Name</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Equipment</TableHead>
          {hasPermission('edit_resource') && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {getFilteredResourcesByType('rooms').map((room) => (
          <TableRow key={room.id}>
            <TableCell className="font-medium">{room.name}</TableCell>
            <TableCell>{room.capacity} people</TableCell>
            <TableCell>{room.location}</TableCell>
            <TableCell>{room.department}</TableCell>
            <TableCell>{getStatusBadge(room.status)}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {room.equipment?.slice(0, 2).map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
                {room.equipment?.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{room.equipment.length - 2} more
                  </Badge>
                )}
              </div>
            </TableCell>
            {hasPermission('edit_resource') && (
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManageResource(room) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditResource(room)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource('rooms', room.id, room)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderEquipmentTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Equipment Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Condition</TableHead>
          {hasPermission('edit_resource') && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {getFilteredResourcesByType('equipment').map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell>{item.department}</TableCell>
            <TableCell>{getStatusBadge(item.status)}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {item.condition}
              </Badge>
            </TableCell>
            {hasPermission('edit_resource') && (
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManageResource(item) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditResource(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource('equipment', item.id, item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderBooksTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Book Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Availability</TableHead>
          {hasPermission('edit_resource') && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {getFilteredResourcesByType('books').map((book) => (
          <TableRow key={book.id}>
            <TableCell className="font-medium">{book.name}</TableCell>
            <TableCell>{book.author}</TableCell>
            <TableCell>{book.location}</TableCell>
            <TableCell>{book.department}</TableCell>
            <TableCell>{getStatusBadge(book.status)}</TableCell>
            <TableCell>
              {book.copies - book.borrowed} of {book.copies} available
            </TableCell>
            {hasPermission('edit_resource') && (
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManageResource(book) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditResource(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource('books', book.id, book)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderFacultyTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Office</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Specialization</TableHead>
          {hasPermission('edit_resource') && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {getFilteredResourcesByType('faculty').map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell>{member.department}</TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>{member.office}</TableCell>
            <TableCell>{getStatusBadge(member.status)}</TableCell>
            <TableCell>{member.specialization || 'N/A'}</TableCell>
            {hasPermission('edit_resource') && (
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canManageResource(member) && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditResource(member)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource('faculty', member.id, member)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'student'
              ? 'Browse available resources for booking'
              : 'Manage all institutional resources in one place'
            }
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resource Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rooms" className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>Rooms ({rooms.length})</span>
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>Equipment ({equipment.length})</span>
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Books ({books.length})</span>
          </TabsTrigger>
          <TabsTrigger value="faculty" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Faculty ({faculty.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Room Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {renderRoomsTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEquipmentTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle>Book Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {renderBooksTable()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {renderFacultyTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}