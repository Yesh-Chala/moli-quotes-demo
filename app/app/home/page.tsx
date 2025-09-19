"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getQuotationsByDealerId, getDealerById, type Quotation, type Dealer } from "@/lib/data-store"
import { requireRole, clearAuthUser, getAuthUser } from "@/lib/auth"
import { Plus, FileText, Calendar, DollarSign, LogOut, Eye, MessageSquare, Clock } from "lucide-react"

export default function DealerHomePage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const user = requireRole("DEALER")
      if (user.dealerId) {
        loadDealerData(user.dealerId)
      }
    } catch {
      router.push("/")
    }
  }, [router])

  const loadDealerData = (dealerId: string) => {
    const dealerData = getDealerById(dealerId)
    const dealerQuotations = getQuotationsByDealerId(dealerId)

    setDealer(dealerData)
    setQuotations(dealerQuotations)
  }

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  const refreshQuotations = () => {
    const user = getAuthUser()
    if (user?.dealerId) {
      loadDealerData(user.dealerId)
    }
  }

  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {dealer.contact}</h1>
              <p className="text-gray-600">{dealer.name}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${quotations.reduce((sum, q) => sum + q.totals.grandTotal, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  quotations.filter((q) => {
                    const now = new Date()
                    const quotationDate = new Date(q.createdAt)
                    return (
                      quotationDate.getMonth() === now.getMonth() && quotationDate.getFullYear() === now.getFullYear()
                    )
                  }).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {quotations.filter((q) => q.status.stage > 1 && q.status.stage < 7).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Quotation */}
        <div className="mb-8">
          <Button onClick={() => router.push("/app/quote/new")} size="lg" className="w-full md:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Create New Quotation
          </Button>
        </div>

        {/* Quotations List */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Your Quotations</h2>
            <Badge variant="secondary">{quotations.length}</Badge>
          </div>
        </div>

        {quotations.length > 0 ? (
          <div className="grid gap-4">
            {quotations.map((quotation) => (
              <Card key={quotation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{quotation.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {quotation.createdAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />${quotation.totals.grandTotal.toLocaleString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={quotation.status.stage === 7 ? "default" : "outline"}
                        className={quotation.status.stage === 7 ? "bg-green-600" : ""}
                      >
                        Stage {quotation.status.stage}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/app/quote/${quotation.id}`)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="font-medium text-gray-500">Subtotal</p>
                      <p className="text-lg">${quotation.totals.subtotal.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Tax</p>
                      <p className="text-lg">${quotation.totals.tax.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Grand Total</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${quotation.totals.grandTotal.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Status and Notes Section */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">Current Status</p>
                        <p className="text-sm text-gray-700">{quotation.status.notes}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Updated {quotation.status.changedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {quotation.notes && (
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-500">Notes</p>
                          <p className="text-sm text-gray-700">{quotation.notes}</p>
                        </div>
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
            <p className="text-gray-600 mb-4">Get started by creating your first quotation using WindowCAD.</p>
            <Button onClick={() => router.push("/app/quote/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Quotation
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
