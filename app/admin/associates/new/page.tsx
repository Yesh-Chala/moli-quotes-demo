"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createAssociate } from "@/lib/data-store"

export default function CreateAssociate() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    commissionPercentage: 5.0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const newAssociate = createAssociate(formData)
      console.log("[v0] Created new associate:", newAssociate)
      router.push("/admin/associates")
    } catch (error) {
      console.error("[v0] Error creating associate:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button onClick={() => router.back()} variant="outline" className="mb-4">
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Associate</h1>
          <p className="text-gray-600">Add a new associate to manage dealers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Associate Information</CardTitle>
            <CardDescription>Enter the details for the new associate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="e.g., assoc002"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., john@windowcad.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter temporary password"
                  required
                />
              </div>

              <div>
                <Label htmlFor="commission">Commission Percentage (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, commissionPercentage: Number.parseFloat(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Create Associate
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
