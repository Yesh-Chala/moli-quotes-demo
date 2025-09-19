"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AdditionalPricingCard } from "@/components/pricing-system/additional-pricing-card"

export default function AdditionalPricingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/pricing-system">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Additional Pricing Management</h1>
          <p className="text-muted-foreground">Configure pricing for screens, packing, grids, and other add-ons</p>
        </div>
      </div>

      <AdditionalPricingCard />
    </div>
  )
}
