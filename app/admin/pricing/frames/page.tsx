"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, Settings } from "lucide-react"
import { requireRole, clearAuthUser } from "@/lib/auth"
import { FramePricingCard } from "@/components/pricing-system/frame-pricing-card"

export default function FramePricingPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      requireRole("ADMIN")
    } catch {
      router.push("/")
    }
  }, [router])

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Moli Windows</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/admin/associates")} variant="outline" size="sm">
                View Associates
              </Button>
              <Button onClick={() => router.push("/admin/dealers")} variant="outline" size="sm">
                View Dealers
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push("/admin/pricing")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Frame Pricing Management</h2>
              <p className="text-gray-600 mt-2">Manage pricing for window and door frames by series and type</p>
            </div>
          </div>
        </div>

        <FramePricingCard />
      </div>
    </div>
  )
}
