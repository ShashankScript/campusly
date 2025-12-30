"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { Eye, EyeOff, Mail, Lock, User, GraduationCap } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "faculty", "admin"])
})

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, register, isLoading } = useAuthStore()

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student"
    }
  })

  const onLogin = async (data) => {
    const result = await login(data)
    if (result.success) {
      toast.success(`Login successful! Welcome ${result.user.name}`)
    } else {
      toast.error(result.error || "Login failed. Please try again.")
    }
  }

  const onRegister = async (data) => {
    const result = await register(data)
    if (result.success) {
      toast.success("Registration successful!")
    } else {
      toast.error(result.error || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-zinc-950">
      {/* Branding Side - Hidden on mobile */}
      <div className="hidden md:flex md:w-5/12 bg-blue-600 dark:bg-blue-700 p-8 lg:p-12 flex-col justify-between relative overflow-hidden h-screen">
        {/* Abstract background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 flex items-center space-x-3">
          <div className="bg-white p-1.5 rounded-lg shadow-lg">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic">Campusly</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter">
            Optimize Your <br />
            <span className="text-blue-200">Campus Flow.</span>
          </h1>
          <p className="text-lg text-blue-100/80 font-medium max-w-sm leading-relaxed">
            The next-generation resource management system for modern institutions.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-blue-100/50 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span>© 2025 Campusly</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-zinc-50 dark:bg-zinc-900/30 min-h-screen overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-[400px] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="md:hidden flex items-center space-x-2 mb-4 justify-center">
            <GraduationCap className="h-7 w-7 text-blue-600" />
            <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase italic">Campusly</span>
          </div>

          <div className="text-center md:text-left space-y-1">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">Welcome Back</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Sign in to manage your campus resources.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-xl h-11 mb-6">
              <TabsTrigger value="login" className="rounded-lg font-bold uppercase tracking-widest text-[10px] h-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg font-bold uppercase tracking-widest text-[10px] h-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 shadow-sm">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 outline-none">
              {/* Demo Accounts Info */}
              <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Test Accounts</h4>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase">Click to fill</span>
                </div>
                <div className="space-y-2">
                  {[
                    { role: 'Admin', email: 'admin@test.com', desc: 'Full system access' },
                    { role: 'Faculty', email: 'faculty@test.com', desc: 'Create resources & bookings' },
                    { role: 'Student', email: 'student@test.com', desc: 'Book available resources' }
                  ].map(demo => (
                    <button
                      key={demo.role}
                      type="button"
                      onClick={() => {
                        loginForm.setValue('email', demo.email)
                        loginForm.setValue('password', 'password123')
                      }}
                      className="w-full text-left p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{demo.role}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{demo.email}</div>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-medium">{demo.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                    All accounts use password: <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded">password123</code>
                  </p>
                </div>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@university.edu"
                      className="pl-10 h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                      {...loginForm.register("email")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</Label>
                    <a href="#" className="text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">Forgot?</a>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-11 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-xs shadow-lg hover:-translate-y-px active:translate-y-0 transition-all" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Michael Doe"
                      className="pl-12 h-14 rounded-2xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                      {...registerForm.register("name")}
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Work Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="name@university.edu"
                      className="pl-12 h-14 rounded-2xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                      {...registerForm.register("email")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" title="Register Password" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Choose Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      className="pl-12 pr-12 h-14 rounded-2xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                      {...registerForm.register("password")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Institutional Role</Label>
                  <select
                    id="role"
                    className="flex h-14 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2 text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    {...registerForm.register("role")}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty Member</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all" disabled={isLoading}>
                  {isLoading ? "Enrolling..." : "Create New Profile"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}