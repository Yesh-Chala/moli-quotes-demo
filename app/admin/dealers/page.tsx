"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getAllDealers, createDealer, getQuotationsByDealerId, type Dealer } from "@/lib/data-store"
import { requireRole, clearAuthUser } from "@/lib/auth"
import { Plus, Users, FileText, LogOut, ArrowLeft } from "lucide-react"

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDealer, setNewDealer] = useState({
    userId: "",
    name: "",
    businessName: "",
    contact: "",
    email: "",
    phone: "",
    password: "",
    associateId: "associate-1", // Default to first associate
  })
  const router = useRouter()

  useEffect(() => {
    try {
      requireRole("ADMIN")
      loadDealers()
    } catch {
      router.push("/")
    }
  }, [router])

  const loadDealers = () => {
    const allDealers = getAllDealers()
    setDealers(allDealers)
  }

  const handleCreateDealer = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDealer.userId || !newDealer.name || !newDealer.businessName || !newDealer.contact || !newDealer.email || !newDealer.phone || !newDealer.password) {
      return
    }

    createDealer(newDealer)
    loadDealers()
    setIsCreateDialogOpen(false)
    setNewDealer({ userId: "", name: "", businessName: "", contact: "", email: "", phone: "", password: "", associateId: "associate-1" })
  }

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  const getQuotationCount = (dealerId: string) => {
    return getQuotationsByDealerId(dealerId).length
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
              <Button onClick={() => router.push("/admin/pricing")} variant="outline" size="sm">
                Product Pricing
              </Button>
              <Button onClick={() => router.push("/admin/associates")} variant="outline" size="sm">
                View Associates
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
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => router.push("/admin/associates")} 
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Home
            </Button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard - Dealers</h2>
          <p className="text-gray-600 mt-2">Manage dealers and their quotations</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Dealers</h3>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Dealer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Dealer</DialogTitle>
                <DialogDescription>
                  Add a new dealer to the system. They will be able to log in and create quotations.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDealer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dealer-user-id">Dealer ID</Label>
                  <Input
                    id="dealer-user-id"
                    value={newDealer.userId}
                    onChange={(e) => setNewDealer({ ...newDealer, userId: e.target.value })}
                    placeholder="dealer004"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={newDealer.businessName}
                    onChange={(e) => setNewDealer({ ...newDealer, businessName: e.target.value })}
                    placeholder="ABC Windows & Doors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact Person</Label>
                  <Input
                    id="contact-name"
                    value={newDealer.name}
                    onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                    placeholder="John Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealer-email">Email</Label>
                  <Input
                    id="dealer-email"
                    type="email"
                    value={newDealer.email}
                    onChange={(e) => setNewDealer({ ...newDealer, email: e.target.value })}
                    placeholder="john@abcwindows.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealer-phone">Phone</Label>
                  <Input
                    id="dealer-phone"
                    value={newDealer.phone}
                    onChange={(e) => setNewDealer({ ...newDealer, phone: e.target.value })}
                    placeholder="+1-555-0104"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealer-password">Password</Label>
                  <Input
                    id="dealer-password"
                    type="password"
                    value={newDealer.password}
                    onChange={(e) => setNewDealer({ ...newDealer, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Dealer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dealers.map((dealer) => (
            <Card
              key={dealer.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/admin/dealers/${dealer.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{dealer.businessName}</CardTitle>
                <CardDescription>ID: {dealer.userId} • Contact: {dealer.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> {dealer.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {dealer.phone}
                  </p>
                  <p>
                    <strong>Created:</strong> {dealer.createdAt.toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1 text-blue-600">
                    <FileText className="w-4 h-4" />
                    <span>{getQuotationCount(dealer.id)} quotations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dealers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dealers yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first dealer.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Dealer
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
