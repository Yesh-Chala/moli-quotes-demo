"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDealer } from "@/lib/data-store"
import { getAuthUser } from "@/lib/auth"

export default function CreateDealer() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currentUser = getAuthUser()
    if (!currentUser || currentUser.role !== "ASSOCIATE") {
      router.push("/")
      return
    }

    try {
      createDealer({
        ...formData,
        associateId: currentUser.associateId!,
      })

      router.push("/associate/dealers")
    } catch (error) {
      console.error("Error creating dealer:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Dealer</h1>
          <p className="text-gray-600">Add a new dealer to your network</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dealer Information</CardTitle>
            <CardDescription>Enter the details for the new dealer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Person</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Dealer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/associate/dealers")}
                  className="flex-1"
                >
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
