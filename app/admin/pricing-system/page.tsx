"use client"

import { FramePricingCard } from "@/components/pricing-system/frame-pricing-card"
import { GlassTypePricingCard } from "@/components/pricing-system/glass-type-pricing-card"
import { AdditionalPricingCard } from "@/components/pricing-system/additional-pricing-card"

export default function PricingSystemPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management System</h1>
          <p className="text-muted-foreground mt-2">
            Manage comprehensive pricing for frames, glass types, and additional components
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <FramePricingCard />
        <GlassTypePricingCard />
        <AdditionalPricingCard />
      </div>
    </div>
  )
}
