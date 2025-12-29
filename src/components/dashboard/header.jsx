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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useResourceStore } from "@/store/resource-store"
import { useAuthStore } from "@/store/auth-store"
import { useTheme } from "next-themes"
import {
  Plus,
  Bell,
  Calendar,
  List,
  BarChart3,
  PlusCircle,
  Settings,
  User,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Palette,
  Shield,
  HelpCircle
} from "lucide-react"

import { usePathname } from "next/navigation"

export function Header({ onNewBooking, onNewResource }) {
  const { hasPermission, user, logout } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [showSettings, setShowSettings] = useState(false)
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
                <DropdownMenuItem onClick={() => setShowSettings(true)} className="text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
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

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              Customize your Campus Resource Optimizer experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Theme Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <Label className="text-base font-medium text-zinc-900 dark:text-zinc-100">Appearance</Label>
              </div>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-light" className="flex items-center space-x-2 cursor-pointer text-zinc-600 dark:text-zinc-300">
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </Label>
                  <Switch
                    id="theme-light"
                    checked={theme === 'light'}
                    onCheckedChange={() => setTheme('light')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-dark" className="flex items-center space-x-2 cursor-pointer text-zinc-600 dark:text-zinc-300">
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </Label>
                  <Switch
                    id="theme-dark"
                    checked={theme === 'dark'}
                    onCheckedChange={() => setTheme('dark')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-system" className="flex items-center space-x-2 cursor-pointer text-zinc-600 dark:text-zinc-300">
                    <Monitor className="h-4 w-4" />
                    <span>System Default</span>
                  </Label>
                  <Switch
                    id="theme-system"
                    checked={theme === 'system'}
                    onCheckedChange={() => setTheme('system')}
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <Label className="text-base font-medium text-zinc-900 dark:text-zinc-100">Notifications</Label>
              </div>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="booking-notifications" className="cursor-pointer text-zinc-600 dark:text-zinc-300">
                    Booking Reminders
                  </Label>
                  <Switch id="booking-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="conflict-notifications" className="cursor-pointer text-zinc-600 dark:text-zinc-300">
                    Conflict Alerts
                  </Label>
                  <Switch id="conflict-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="cursor-pointer text-zinc-600 dark:text-zinc-300">
                    Email Notifications
                  </Label>
                  <Switch id="email-notifications" />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            {user?.role === 'admin' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <Label className="text-base font-medium text-zinc-900 dark:text-zinc-100">Privacy & Security</Label>
                </div>

                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analytics-tracking" className="cursor-pointer text-zinc-600 dark:text-zinc-300">
                      Analytics Tracking
                    </Label>
                    <Switch id="analytics-tracking" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="data-export" className="cursor-pointer text-zinc-600 dark:text-zinc-300">
                      Allow Data Export
                    </Label>
                    <Switch id="data-export" defaultChecked />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button variant="outline" onClick={() => setShowSettings(false)} className="border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}