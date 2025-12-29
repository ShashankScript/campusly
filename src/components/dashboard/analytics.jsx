"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { useResourceStore } from "@/store/resource-store"
import { useAuthStore } from "@/store/auth-store"
import {
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Monitor,
  BookOpen,
  Calendar,
  Clock,
  Activity,
  AlertTriangle
} from "lucide-react"

export function Analytics() {
  const { 
    rooms, 
    equipment, 
    books, 
    faculty, 
    bookings, 
    getDashboardStats,
    getBookingConflicts 
  } = useResourceStore()
  const { user } = useAuthStore()

  const stats = getDashboardStats()

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    // Resource distribution
    const resourceDistribution = [
      { name: 'Rooms', value: rooms.length, color: '#3b82f6' },
      { name: 'Equipment', value: equipment.length, color: '#10b981' },
      { name: 'Books', value: books.length, color: '#f59e0b' },
      { name: 'Faculty', value: faculty.length, color: '#8b5cf6' }
    ]

    // Weekly utilization (mock data based on bookings)
    const utilizationData = [
      { name: 'Mon', rooms: 85, equipment: 70, books: 45, faculty: 90 },
      { name: 'Tue', rooms: 78, equipment: 65, books: 52, faculty: 85 },
      { name: 'Wed', rooms: 92, equipment: 80, books: 48, faculty: 95 },
      { name: 'Thu', rooms: 88, equipment: 75, books: 55, faculty: 88 },
      { name: 'Fri', rooms: 95, equipment: 85, books: 60, faculty: 92 },
      { name: 'Sat', rooms: 45, equipment: 30, books: 35, faculty: 40 },
      { name: 'Sun', rooms: 25, equipment: 20, books: 25, faculty: 30 }
    ]

    // Monthly booking trends
    const now = new Date()
    const bookingTrendsData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date)
        return bookingDate.getMonth() === date.getMonth() && 
               bookingDate.getFullYear() === date.getFullYear()
      })
      
      const conflicts = bookings.filter(b => {
        const bookingDate = new Date(b.date)
        return bookingDate.getMonth() === date.getMonth() && 
               bookingDate.getFullYear() === date.getFullYear() &&
               getBookingConflicts(b).length > 0
      })

      bookingTrendsData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        bookings: monthBookings.length,
        conflicts: conflicts.length
      })
    }

    // Peak hours analysis
    const peakHoursData = []
    for (let hour = 8; hour <= 19; hour++) {
      const hourStr = `${hour}:00`
      const hourBookings = bookings.filter(b => {
        const startHour = parseInt(b.startTime.split(':')[0])
        const endHour = parseInt(b.endTime.split(':')[0])
        return hour >= startHour && hour < endHour
      })
      
      peakHoursData.push({
        hour: hourStr,
        usage: Math.round((hourBookings.length / Math.max(bookings.length, 1)) * 100)
      })
    }

    return {
      resourceDistribution,
      utilizationData,
      bookingTrendsData,
      peakHoursData
    }
  }, [rooms, equipment, books, faculty, bookings, getBookingConflicts])

  const keyMetrics = [
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      title: "Today's Bookings",
      value: stats.todayBookings.toString(),
      change: "+5.2%",
      trend: "up",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Available Resources",
      value: (stats.availableRooms + stats.availableEquipment).toString(),
      change: "-2.1%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings.toString(),
      change: "No change",
      trend: "neutral",
      icon: Clock,
      color: "text-purple-600"
    }
  ]

  // Get recent conflicts
  const recentConflicts = bookings
    .map(booking => ({
      ...booking,
      conflicts: getBookingConflicts(booking)
    }))
    .filter(booking => booking.conflicts.length > 0)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Insights and utilization metrics for all resources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' && (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      {stat.trend === 'down' && (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Utilization Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rooms" fill="#3b82f6" name="Rooms" />
                <Bar dataKey="equipment" fill="#10b981" name="Equipment" />
                <Bar dataKey="books" fill="#f59e0b" name="Books" />
                <Bar dataKey="faculty" fill="#8b5cf6" name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.resourceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.resourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Booking Trends</TabsTrigger>
          <TabsTrigger value="peak-hours">Peak Hours</TabsTrigger>
          <TabsTrigger value="conflicts">Conflict Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.bookingTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Total Bookings"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conflicts" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.3}
                    name="Conflicts"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak-hours">
          <Card>
            <CardHeader>
              <CardTitle>Peak Usage Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Usage %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Conflicts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentConflicts.length > 0 ? (
                  recentConflicts.map((booking) => (
                    <div key={booking.id} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-300">
                          {booking.resourceName}
                        </h4>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {booking.date} - {booking.startTime} to {booking.endTime}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          Booked by: {booking.bookedBy}
                        </p>
                      </div>
                      <Badge variant="destructive" className="mt-2">Conflict Detected</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-800 dark:text-green-300">No conflicts detected!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conflict Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Conflicts</span>
                  <Badge variant="secondary">{recentConflicts.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Resolved</span>
                  <Badge className="bg-green-100 text-green-800">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  <Badge variant="outline">{recentConflicts.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Auto-Resolved</span>
                  <Badge variant="secondary">0</Badge>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Resolution Rate</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {recentConflicts.length === 0 ? '100%' : '0%'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}