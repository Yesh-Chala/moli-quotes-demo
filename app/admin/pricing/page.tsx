"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole, clearAuthUser } from "@/lib/auth"
import { LogOut, ArrowLeft, DollarSign, Settings, Palette, Plus } from "lucide-react"

export default function AdminPricingPage() {
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

  const pricingCategories = [
    {
      id: "frames",
      title: "Frame Pricing",
      description: "Manage pricing for window and door frames by series and type",
      icon: Settings,
      route: "/admin/pricing/frames",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      id: "glazing", 
      title: "Glazing Pricing",
      description: "Set pricing for different glass types and specifications",
      icon: Palette,
      route: "/admin/pricing/glazing",
      color: "bg-green-50 border-green-200", 
      iconColor: "text-green-600"
    },
    {
      id: "additional",
      title: "Additional Pricing",
      description: "Configure pricing for screens, packing, grids, and other add-ons",
      icon: Plus,
      route: "/admin/pricing/additional",
      color: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600"
    }
  ]

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
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/associates")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Home
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Pricing Management System</h2>
              <p className="text-gray-600 mt-2">Manage comprehensive pricing for frames, glass types, and additional components</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pricingCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card 
                key={category.id} 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${category.color}`}
                onClick={() => router.push(category.route)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      <IconComponent className={`w-6 h-6 ${category.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {category.description}
                  </CardDescription>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Manage {category.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing System Overview</h3>
          <p className="text-gray-600 mb-4">
            This sophisticated pricing system allows you to manage all aspects of your product pricing:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <strong>Frame Pricing:</strong> Configure prices by series (85, 76, 108, etc.) and product types
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <strong>Glazing Pricing:</strong> Set prices for different glass configurations and Low-E options
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <strong>Additional Pricing:</strong> Manage costs for screens, hardware, and special features
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
