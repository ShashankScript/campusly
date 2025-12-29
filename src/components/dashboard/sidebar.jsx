"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useResourceStore } from "@/store/resource-store"
import { useAuthStore } from "@/store/auth-store"
import {
  Calendar,
  List,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Users,
  BookOpen,
  Monitor,
  MapPin,
} from "lucide-react"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: 'Calendar', icon: Calendar, href: '/dashboard' },
  { name: 'Resources', icon: List, href: '/dashboard/resources' },
  { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
]

const resourceTypes = [
  { name: 'Rooms', icon: MapPin, count: 0 },
  { name: 'Equipment', icon: Monitor, count: 0 },
  { name: 'Books', icon: BookOpen, count: 0 },
  { name: 'Faculty', icon: Users, count: 0 },
]

export function Sidebar() {
  const { rooms, equipment, books, faculty, getDashboardStats } = useResourceStore()
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const stats = getDashboardStats()

  const resourceCounts = {
    rooms: rooms.length,
    equipment: equipment.length,
    books: books.length,
    faculty: faculty.length
  }

  return (
    <div className="flex flex-col w-64 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-500" />
        <span className="ml-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Campusly
        </span>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center">
          <div className="shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user?.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Today</span>
            </div>
            <Badge variant="secondary" className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {stats.todayBookings}
            </Badge>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Available</span>
            </div>
            <Badge variant="outline" className="text-xs border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
              {stats.availableRooms}
            </Badge>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Total</span>
            </div>
            <Badge variant="outline" className="text-xs border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
              {stats.totalBookings}
            </Badge>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Active</span>
            </div>
            <Badge variant="secondary" className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {stats.activeBookings}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/70"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* Resource Summary */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Resources
          </h3>
          <div className="mt-2 space-y-1">
            {resourceTypes.map((type) => {
              const count = resourceCounts[type.name.toLowerCase()] || 0
              return (
                <div
                  key={type.name}
                  className="flex items-center justify-between px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300"
                >
                  <div className="flex items-center">
                    <type.icon className="mr-3 h-4 w-4" />
                    {type.name}
                  </div>
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <Button variant="ghost" className="w-full justify-start text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100">
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}