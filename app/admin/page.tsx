"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { requireRole } from "@/lib/auth"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      requireRole("ADMIN")
      router.push("/admin/associates")
    } catch {
      router.push("/")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Admin Dashboard...</h1>
      </div>
    </div>
  )
}
