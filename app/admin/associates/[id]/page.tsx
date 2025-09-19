"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  getAssociateById,
  getDealersByAssociateId,
  getQuotationsByDealerId,
  type Associate,
  type Dealer,
  type Quotation,
} from "@/lib/data-store"
import { requireRole, clearAuthUser } from "@/lib/auth"
import { ArrowLeft, Users, FileText, DollarSign, Percent, Building2, Mail, Phone } from "lucide-react"

export default function AssociateDetailsPage() {
  const [associate, setAssociate] = useState<Associate | null>(null)
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const associateId = params.id as string

  useEffect(() => {
    try {
      requireRole("ADMIN")
      loadAssociateData()
    } catch {
      router.push("/")
    }
  }, [router, associateId])

  const loadAssociateData = () => {
    const associateData = getAssociateById(associateId)
    if (!associateData) {
      router.push("/admin/associates")
      return
    }

    setAssociate(associateData)
    const dealersData = getDealersByAssociateId(associateId)
    setDealers(dealersData)
    setLoading(false)
  }

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  const getDealerStats = (dealerId: string) => {
    const quotations = getQuotationsByDealerId(dealerId)
    const totalRevenue = quotations.reduce((sum, q) => sum + q.totals.grandTotal, 0)
    const totalCommission = associate ? totalRevenue * (associate.commissionPercentage / 100) : 0
    return { 
      quotationCount: quotations.length, 
      totalRevenue, 
      totalCommission,
      recentQuotations: quotations.slice(0, 3) // Last 3 quotations
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

  if (!associate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Associate not found</h1>
          <Button onClick={() => router.push("/admin/associates")}>
            Back to Associates
          </Button>
        </div>
      </div>
    )
  }

  const totalStats = dealers.reduce((acc, dealer) => {
    const stats = getDealerStats(dealer.id)
    return {
      totalQuotations: acc.totalQuotations + stats.quotationCount,
      totalRevenue: acc.totalRevenue + stats.totalRevenue,
      totalCommission: acc.totalCommission + stats.totalCommission,
    }
  }, { totalQuotations: 0, totalRevenue: 0, totalCommission: 0 })

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
              Back to Associates
            </Button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{associate.name}</h2>
          <p className="text-gray-600 mt-2">Associate ID: {associate.userId} • {associate.commissionPercentage}% Commission</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dealers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalQuotations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalStats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalStats.totalCommission.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Dealers Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Dealers</h3>
          </div>

          {dealers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No dealers yet</h3>
                <p className="text-gray-600">This associate doesn't have any dealers assigned yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dealers.map((dealer) => {
                const stats = getDealerStats(dealer.id)
                return (
                  <Card
                    key={dealer.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/admin/dealers/${dealer.id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{dealer.businessName}</CardTitle>
                      <CardDescription>ID: {dealer.userId}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="truncate">{dealer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{dealer.phone}</span>
                        </div>
                        
                        <div className="border-t pt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Quotations:</span>
                            <Badge variant="secondary">{stats.quotationCount}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Revenue:</span>
                            <span className="font-semibold text-green-600">${stats.totalRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Commission:</span>
                            <span className="font-semibold text-blue-600">${stats.totalCommission.toFixed(2)}</span>
                          </div>
                        </div>

                        {stats.recentQuotations.length > 0 && (
                          <div className="border-t pt-3">
                            <p className="text-xs text-gray-500 mb-2">Recent Quotations:</p>
                            <div className="space-y-1">
                              {stats.recentQuotations.map((quotation) => (
                                <div key={quotation.id} className="flex justify-between items-center text-xs">
                                  <span className="truncate">{quotation.customerName}</span>
                                  <span className="text-green-600">${quotation.totals.grandTotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
