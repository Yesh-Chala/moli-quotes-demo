"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDealerById, getQuotationsByDealerId, type Dealer, type Quotation } from "@/lib/data-store"
import { requireRole } from "@/lib/auth"
import { ArrowLeft, FileText, Calendar, DollarSign } from "lucide-react"

export default function DealerDetailPage() {
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const router = useRouter()
  const params = useParams()
  const dealerId = params.id as string

  useEffect(() => {
    try {
      requireRole("ADMIN")
      loadDealerData()
    } catch {
      router.push("/")
    }
  }, [dealerId, router])

  const loadDealerData = () => {
    const dealerData = getDealerById(dealerId)
    if (!dealerData) {
      router.push("/admin/dealers")
      return
    }

    setDealer(dealerData)
    const dealerQuotations = getQuotationsByDealerId(dealerId)
    setQuotations(dealerQuotations)
  }

  if (!dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading dealer information...</h1>
        </div>
      </div>
    )
  }

  const totalRevenue = quotations.reduce((sum, q) => sum + q.totals.grandTotal, 0)

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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/dealers")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dealers
            </Button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{dealer.businessName}</h2>
          <p className="text-gray-600 mt-2">Dealer ID: {dealer.userId} • Contact: {dealer.name}</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              <CardTitle className="text-sm font-medium">Contact Person</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
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
                onClick={() => router.push(`/admin/quotations/${quotation.id}`)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{quotation.name}</CardTitle>
                      <CardDescription className="mt-2">
                        Customer: {quotation.customerName}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">#{quotation.id.split('-')[1]}</Badge>
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
                      <Badge variant={quotation.status.stage === 4 ? "default" : "secondary"}>
                        Stage {quotation.status.stage}
                      </Badge>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Value:</span>
                        <span className="text-lg font-semibold text-green-600">
                          ${quotation.totals.grandTotal.toFixed(2)}
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
