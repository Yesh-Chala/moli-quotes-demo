"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getDealerById,
  getQuotationsByDealerId,
  getAssociateById,
  type Dealer,
  type Quotation,
  type Associate,
} from "@/lib/data-store"
import { getAuthUser, clearAuthUser } from "@/lib/auth"
import { ArrowLeft, FileText, DollarSign, Building2, Mail, Phone, Plus, LogOut } from "lucide-react"

export default function AssociateDealerDetailsPage() {
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [associate, setAssociate] = useState<Associate | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const dealerId = params.id as string

  useEffect(() => {
    const currentUser = getAuthUser()
    if (!currentUser || currentUser.role !== "ASSOCIATE") {
      router.push("/")
      return
    }

    const associateData = getAssociateById(currentUser.associateId!)
    if (!associateData) {
      router.push("/")
      return
    }

    const dealerData = getDealerById(dealerId)
    if (!dealerData || dealerData.associateId !== associateData.id) {
      router.push("/associate")
      return
    }

    setAssociate(associateData)
    setDealer(dealerData)
    const dealerQuotations = getQuotationsByDealerId(dealerId)
    setQuotations(dealerQuotations)
    setLoading(false)
  }, [router, dealerId])

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  const getStatusColor = (stage: number) => {
    switch (stage) {
      case 1: return "bg-yellow-100 text-yellow-800"
      case 2: return "bg-blue-100 text-blue-800"
      case 3: return "bg-purple-100 text-purple-800"
      case 4: return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (stage: number) => {
    switch (stage) {
      case 1: return "Draft"
      case 2: return "Sent to Customer"
      case 3: return "Under Review"
      case 4: return "Approved"
      default: return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!dealer || !associate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dealer not found</h1>
          <Button onClick={() => router.push("/associate")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const totalRevenue = quotations.reduce((sum, q) => sum + q.totals.grandTotal, 0)
  const totalCommission = totalRevenue * (associate.commissionPercentage / 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Moli Windows</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/associate")} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create New Dealer
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
              onClick={() => router.push("/associate")} 
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{dealer.businessName}</h2>
          <p className="text-gray-600 mt-2">Dealer ID: {dealer.userId} • Contact: {dealer.name}</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalCommission.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Person</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{dealer.name}</div>
              <p className="text-sm text-muted-foreground">{dealer.email}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quotations Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Quotations</h3>
            <Badge variant="secondary">{quotations.length}</Badge>
          </div>
        </div>

        {quotations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quotations.map((quotation) => (
              <Card 
                key={quotation.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/associate/quotations/${quotation.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{quotation.name}</CardTitle>
                      <CardDescription className="mt-2">
                        Customer: {quotation.customerName}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(quotation.status.stage)}>
                      {getStatusText(quotation.status.stage)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span>{quotation.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="outline">Stage {quotation.status.stage}</Badge>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Value:</span>
                        <span className="text-lg font-semibold text-green-600">
                          ${quotation.totals.grandTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600">Your Commission:</span>
                        <span className="text-sm font-semibold text-blue-600">
                          ${(quotation.totals.grandTotal * (associate.commissionPercentage / 100)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {quotation.notes && (
                      <div className="border-t pt-3">
                        <p className="text-xs text-gray-500 line-clamp-2">{quotation.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations yet</h3>
            <p className="text-gray-600">This dealer hasn't created any quotations yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
