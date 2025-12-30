"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth-store"
import { useTheme } from "next-themes"
import {
  Plus,
  Bell,
  Calendar,
  List,
  BarChart3,
  PlusCircle,
  User,
  Moon,
  Sun,
  LogOut,
  HelpCircle
} from "lucide-react"

import { usePathname } from "next/navigation"

export function Header({ onNewBooking, onNewResource }) {
  const { hasPermission, user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const viewModeConfig = {
    '/dashboard': { icon: Calendar, label: 'Calendar View' },
    '/dashboard/resources': { icon: List, label: 'Resources' },
    '/dashboard/analytics': { icon: BarChart3, label: 'Analytics' }
  }

  const currentView = viewModeConfig[pathname] || { icon: Calendar, label: 'Dashboard' }

  const handleLogout = () => {
    logout()
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Title and View Mode */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <currentView.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {currentView.label}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="h-10 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <Button variant="outline" size="sm" className="h-10 relative border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Actions based on role */}
            <div className="flex items-center space-x-2">
              {/* New Resource - Only admin and faculty */}
              {hasPermission('create_resource') && (
                <Button onClick={onNewResource} variant="outline" size="sm" className="h-10 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              )}

              {/* New Booking - All roles can create bookings */}
              <Button onClick={onNewBooking} size="sm" className="h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <DropdownMenuLabel className="text-zinc-900 dark:text-zinc-100">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                <DropdownMenuItem className="text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  )
}