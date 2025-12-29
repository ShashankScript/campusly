"use client"

import { useAuthStore } from "@/store/auth-store"
import { LoginForm } from "@/components/auth/login-form"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) {
    return null
  }

  return <LoginForm />
}
