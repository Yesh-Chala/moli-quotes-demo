"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDealersByAssociateId, getQuotationsByDealerId, getAssociateById } from "@/lib/data-store"
import { getAuthUser } from "@/lib/auth"
import type { Associate, Dealer, Quotation } from "@/lib/data-store"

export default function AssociateDealers() {
  const router = useRouter()
  const [associate, setAssociate] = useState<Associate | null>(null)
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [dealerQuotations, setDealerQuotations] = useState<Record<string, Quotation[]>>({})

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

    setAssociate(associateData)

    const associateDealers = getDealersByAssociateId(associateData.id)
    setDealers(associateDealers)

    // Load quotations for each dealer
    const quotationsMap: Record<string, Quotation[]> = {}
    associateDealers.forEach((dealer) => {
      quotationsMap[dealer.id] = getQuotationsByDealerId(dealer.id)
    })
    setDealerQuotations(quotationsMap)
  }, [router])

  if (!associate) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dealers</h1>
            <p className="text-gray-600">Manage your assigned dealers</p>
          </div>
          <Button onClick={() => router.push("/associate/dealers/new")}>Create New Dealer</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealers.map((dealer) => {
            const quotations = dealerQuotations[dealer.id] || []
            const totalValue = quotations.reduce((sum, q) => sum + q.totals.grandTotal, 0)
            const commission = totalValue * (associate.commissionPercentage / 100)

            return (
              <Card key={dealer.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{dealer.name}</span>
                    <Badge variant="secondary">{quotations.length} quotes</Badge>
                  </CardTitle>
                  <CardDescription>{dealer.contact}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{dealer.email}</p>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">Total Quote Value: ${totalValue.toFixed(2)}</p>
                      <p className="text-sm text-green-600">Your Commission: ${commission.toFixed(2)}</p>
                    </div>
                    <div className="pt-2">
                      <Button
                        onClick={() => router.push(`/associate/dealers/${dealer.id}`)}
                        className="w-full"
                        variant="outline"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {dealers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No dealers assigned yet</p>
              <Button onClick={() => router.push("/associate/dealers/new")}>Create Your First Dealer</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
