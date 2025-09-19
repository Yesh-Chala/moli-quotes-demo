"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FramePricingCard } from "@/components/pricing-system/frame-pricing-card"

export default function FramePricingPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Frame Pricing Management</h1>
          <p className="text-muted-foreground">Manage pricing for window and door frames by series and type</p>
        </div>
      </div>

      <FramePricingCard />
    </div>
  )
}
