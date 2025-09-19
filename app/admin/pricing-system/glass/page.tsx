"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GlassTypePricingCard } from "@/components/pricing-system/glass-type-pricing-card"

export default function GlassPricingPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Glass Type Pricing Management</h1>
          <p className="text-muted-foreground">Set pricing for different glass types and specifications</p>
        </div>
      </div>

      <GlassTypePricingCard />
    </div>
  )
}
