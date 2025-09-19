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
import {
  getAllAssociates,
  createAssociate,
  getDealersByAssociateId,
  getQuotationsByAssociateId,
  type Associate,
} from "@/lib/data-store"
import { requireRole, clearAuthUser } from "@/lib/auth"
import { Plus, Users, FileText, LogOut, Percent } from "lucide-react"

export default function AdminAssociatesPage() {
  const [associates, setAssociates] = useState<Associate[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAssociate, setNewAssociate] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    commissionPercentage: 5.0,
  })
  const router = useRouter()

  useEffect(() => {
    try {
      requireRole("ADMIN")
      loadAssociates()
    } catch {
      router.push("/")
    }
  }, [router])

  const loadAssociates = () => {
    const allAssociates = getAllAssociates()
    setAssociates(allAssociates)
  }

  const handleCreateAssociate = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAssociate.userId || !newAssociate.name || !newAssociate.email || !newAssociate.password) {
      return
    }

    createAssociate(newAssociate)
    loadAssociates()
    setIsCreateDialogOpen(false)
    setNewAssociate({ userId: "", name: "", email: "", password: "", commissionPercentage: 5.0 })
  }

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  const getAssociateStats = (associateId: string) => {
    const dealers = getDealersByAssociateId(associateId)
    const quotations = getQuotationsByAssociateId(associateId)
    const totalRevenue = quotations.reduce((sum, q) => sum + q.totals.grandTotal, 0)
    return { dealerCount: dealers.length, quotationCount: quotations.length, totalRevenue }
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard - Associates</h2>
          <p className="text-gray-600 mt-2">Manage associates and their commission structure</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Associates</h3>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Associate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Associate</DialogTitle>
                <DialogDescription>
                  Add a new associate who will manage dealers and earn commission on their quotations.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAssociate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-id">User ID</Label>
                  <Input
                    id="user-id"
                    value={newAssociate.userId}
                    onChange={(e) => setNewAssociate({ ...newAssociate, userId: e.target.value })}
                    placeholder="assoc001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="associate-name">Full Name</Label>
                  <Input
                    id="associate-name"
                    value={newAssociate.name}
                    onChange={(e) => setNewAssociate({ ...newAssociate, name: e.target.value })}
                    placeholder="Mike Johnson"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="associate-email">Email</Label>
                  <Input
                    id="associate-email"
                    type="email"
                    value={newAssociate.email}
                    onChange={(e) => setNewAssociate({ ...newAssociate, email: e.target.value })}
                    placeholder="mike@windowcad.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="associate-password">Temporary Password</Label>
                  <Input
                    id="associate-password"
                    type="password"
                    value={newAssociate.password}
                    onChange={(e) => setNewAssociate({ ...newAssociate, password: e.target.value })}
                    placeholder="Enter temporary password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission">Commission Percentage</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newAssociate.commissionPercentage}
                    onChange={(e) =>
                      setNewAssociate({ ...newAssociate, commissionPercentage: Number.parseFloat(e.target.value) })
                    }
                    placeholder="5.0"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Associate</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {associates.map((associate) => {
            const stats = getAssociateStats(associate.id)
            const commission = stats.totalRevenue * (associate.commissionPercentage / 100)

            return (
              <Card
                key={associate.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/admin/associates/${associate.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{associate.name}</CardTitle>
                  <CardDescription>ID: {associate.userId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Email:</strong> {associate.email}
                    </p>
                    <div className="flex items-center gap-1 text-green-600">
                      <Percent className="w-4 h-4" />
                      <span>{associate.commissionPercentage}% Commission</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Users className="w-4 h-4" />
                      <span>{stats.dealerCount} dealers</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600">
                      <FileText className="w-4 h-4" />
                      <span>{stats.quotationCount} quotations</span>
                    </div>
                    <p className="font-semibold text-green-600">Total Commission: ${commission.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {associates.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No associates yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first associate.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Associate
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
