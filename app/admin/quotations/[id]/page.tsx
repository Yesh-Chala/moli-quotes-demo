"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  getQuotationById,
  getDealerById,
  getAssociateById,
  type Quotation,
  type Dealer,
  type Associate,
} from "@/lib/data-store"
import { requireRole, clearAuthUser } from "@/lib/auth"
import { ArrowLeft, FileText, Calendar, DollarSign, User, Building2, Mail, Phone, Percent } from "lucide-react"

export default function QuotationDetailsPage() {
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [associate, setAssociate] = useState<Associate | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string

  useEffect(() => {
    try {
      requireRole("ADMIN")
      loadQuotationData()
    } catch {
      router.push("/")
    }
  }, [router, quotationId])

  const loadQuotationData = () => {
    const quotationData = getQuotationById(quotationId)
    if (!quotationData) {
      router.push("/admin/dealers")
      return
    }

    setQuotation(quotationData)
    
    const dealerData = getDealerById(quotationData.dealerId)
    setDealer(dealerData)
    
    const associateData = getAssociateById(quotationData.associateId)
    setAssociate(associateData)
    
    setLoading(false)
  }

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
          <h1 className="text-2xl font-bold mb-4">Loading quotation...</h1>
        </div>
      </div>
    )
  }

  if (!quotation || !dealer || !associate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quotation not found</h1>
          <Button onClick={() => router.push("/admin/dealers")}>
            Back to Dealers
          </Button>
        </div>
      </div>
    )
  }

  const commission = quotation.totals.grandTotal * (associate.commissionPercentage / 100)

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
              <Button onClick={() => router.push("/admin/associates")} variant="outline" size="sm">
                View Associates
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/dealers/${dealer.id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dealer
            </Button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{quotation.name}</h2>
          <p className="text-gray-600 mt-2">Customer: {quotation.customerName} • Quote #{quotation.id.split('-')[1]}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quotation Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Quotation Overview</CardTitle>
                    <CardDescription className="mt-2">
                      Created on {quotation.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(quotation.status.stage)}>
                    {getStatusText(quotation.status.stage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-2xl font-bold">${quotation.totals.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tax</p>
                      <p className="text-2xl font-bold">${quotation.totals.tax.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Grand Total</p>
                      <p className="text-2xl font-bold text-green-600">${quotation.totals.grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {quotation.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{quotation.notes}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-2">Status History</h4>
                    <div className="space-y-2">
                      {quotation.statusHistory.map((status, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Badge className={getStatusColor(status.stage)}>
                            {getStatusText(status.stage)}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm">{status.notes}</p>
                            <p className="text-xs text-gray-500">
                              {status.changedAt.toLocaleDateString()} by {status.changedBy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            {quotation.lineItems && quotation.lineItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quotation.lineItems.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name || `Item ${index + 1}`}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="font-semibold">${(item.price || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dealer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Dealer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Name</p>
                    <p className="font-semibold">{dealer.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Person</p>
                    <p>{dealer.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{dealer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{dealer.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Associate Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Associate Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Associate Name</p>
                    <p className="font-semibold">{associate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm">{associate.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{associate.commissionPercentage}% Commission</span>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Commission on this quote</p>
                    <p className="text-lg font-semibold text-blue-600">${commission.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
