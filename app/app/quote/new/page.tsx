"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createQuotation, getDealerById } from "@/lib/data-store"
import { requireRole, getAuthUser } from "@/lib/auth"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { extractCompletePricingDetails } from "@/lib/pricing-engine"
import { GridDivisionPopup } from "@/components/grid-division-popup"

export default function NewQuotePage() {
  const [quotationName, setQuotationName] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [showGridDivisionPopup, setShowGridDivisionPopup] = useState(false)
  const [quotationData, setQuotationData] = useState<any>(null)
  const [gridDivisions, setGridDivisions] = useState<any[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      requireRole("DEALER")
    } catch {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e && e.data && e.data.isWindowCAD && e.data.appType === "Retail") {
        console.log("WindowCAD data received:", e.data)

        if (e.data.pdfBlob && e.data.projectJson) {
          handleSaveQuotation(e.data.pdfBlob, e.data.projectJson)
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [quotationName])

  const handleSaveQuotation = (pdfBlob: Blob, projectJson: any) => {
    if (!quotationName.trim()) {
      alert("Please enter a quotation name first")
      return
    }

    const user = getAuthUser()
    if (!user?.dealerId) {
      alert("User session invalid")
      return
    }

    // Get dealer info to get associate ID
    const dealer = getDealerById(user.dealerId)
    if (!dealer) {
      alert("Dealer not found")
      return
    }

    // Parse the project data
    const cleanedData = extractImportantDetails(projectJson)

    // Store quotation data and show grid division popup
    setQuotationData({
      pdfBlob,
      projectJson,
      cleanedData,
      user,
      dealer
    })
    setShowGridDivisionPopup(true)
  }

  const handleGridDivisionConfirm = (divisions: any[], screenSelections: any[]) => {
    setGridDivisions(divisions)
    
    // Now create the quotation with grid divisions and screen selections
    if (quotationData) {
      const { pdfBlob, cleanedData, user, dealer } = quotationData

      // Add grid divisions and screen selections to line items
      const itemsWithConfigurations = cleanedData.items?.map((item: any) => {
        const gridDivision = divisions.find(div => div.itemId === item.itemNumber.toString())
        const screenSelection = screenSelections.find(screen => screen.itemId === item.itemNumber.toString())
        
        return {
          ...item,
          gridDivision: gridDivision ? {
            horizontalLines: gridDivision.horizontalLines,
            verticalLines: gridDivision.verticalLines,
            totalGrids: gridDivision.horizontalLines * gridDivision.verticalLines
          } : null,
          screenConfiguration: screenSelection ? {
            needsScreen: screenSelection.needsScreen,
            series: screenSelection.series
          } : {
            needsScreen: item.designDetails?.series === 108 || item.designDetails?.series === 118, // Default for 108/118 series
            series: item.designDetails?.series || 0
          }
        }
      }) || []

      // Create quotation
      const newQuotation = createQuotation({
        dealerId: user.dealerId,
        associateId: dealer.associateId,
        name: quotationName,
        totals: {
          subtotal: cleanedData.summary?.subtotal || 0,
          tax: cleanedData.summary?.tax || 0,
          grandTotal: cleanedData.summary?.grandTotal || 0,
        },
        lineItems: itemsWithConfigurations,
        pdfUrl: URL.createObjectURL(pdfBlob),
        gridDivisions: divisions, // Store grid divisions separately
        screenSelections: screenSelections, // Store screen selections separately
      })

      console.log("✅ Quotation saved successfully with configurations:", newQuotation)

      setShowGridDivisionPopup(false)
      setShowNotification(true)
      setTimeout(() => {
        router.push("/app/home")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Grid Division Popup */}
      <GridDivisionPopup
        isOpen={showGridDivisionPopup}
        onClose={() => setShowGridDivisionPopup(false)}
        onConfirm={handleGridDivisionConfirm}
        quotationItems={quotationData?.cleanedData?.items || []}
      />

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quotation Saved!</h3>
            <p className="text-gray-600">Taking you back to home page to view your quote...</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/app/home")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Quotation</h1>
              <p className="text-gray-600">Design your windows and doors using WindowCAD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Follow these steps to create your quotation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="quotation-name">Quotation Name *</Label>
                <Input
                  id="quotation-name"
                  value={quotationName}
                  onChange={(e) => setQuotationName(e.target.value)}
                  placeholder="e.g., Residential Window Project"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">How to use WindowCAD:</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Enter a quotation name above</li>
                  <li>2. Use the WindowCAD designer below to create your design</li>
                  <li>3. Click "Save Quote" in WindowCAD when finished</li>
                  <li>4. You'll be automatically redirected to view your saved quotation</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="relative" style={{ height: "70vh" }}>
              <iframe
                ref={iframeRef}
                src="https://www.windowsoftware.co.uk/windowcad7/?interface=retail&username=moliwindows"
                className="w-full h-full border-none rounded-lg"
                title="WindowCAD Designer"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function extractImportantDetails(projectJson: any) {
  const quote = {
    project: {
      version: projectJson?.version || "Unknown",
      createdDate: projectJson?.createdDate || null,
      status: projectJson?.statusName || "Unknown",
      includeInstallation: projectJson?.includeInstallation || false,
      taxPercent: projectJson?.taxPercent || 0,
    },
    items: [] as any[],
    summary: {
      totalItems: 0,
      totalQuantity: 0,
      subtotal: 0,
      tax: 0,
      grandTotal: 0,
    },
  }

  // Process each bay with sophisticated pricing engine
  if (projectJson?.bays && Array.isArray(projectJson.bays)) {
    projectJson.bays.forEach((bay: any, bayIndex: number) => {
      const frameColours = bay.frameColours || []
      const externalFinish = frameColours.length > 0 ? frameColours[0] : "Unknown"
      const internalFinish = frameColours.length > 1 ? frameColours[1] : externalFinish

      // Extract sophisticated pricing data
      const pricingData = extractCompletePricingDetails(bay)

      // Calculate the final price using sophisticated pricing or fallback to WindowCAD price
      let unitPrice = bay.price || 0
      let totalPrice = (bay.quantity || 1) * unitPrice

      // Use sophisticated pricing if available
      if (pricingData.totalEstimate) {
        const sophisticatedPrice = parseFloat(pricingData.totalEstimate)
        unitPrice = sophisticatedPrice
        totalPrice = (bay.quantity || 1) * sophisticatedPrice
        
        console.log(`💰 Using sophisticated pricing for ${pricingData.productName.fullName}: $${sophisticatedPrice}`)
      } else if (pricingData.productPricing?.found && pricingData.productPricing.productPrice) {
        // Use just product pricing if glazing isn't available
        const productPrice = parseFloat(pricingData.productPricing.productPrice)
        unitPrice = productPrice
        totalPrice = (bay.quantity || 1) * productPrice
        
        console.log(`🪟 Using product pricing only for ${pricingData.productName.fullName}: $${productPrice}`)
      } else {
        console.log(`⚠️ Falling back to WindowCAD price for ${pricingData.productName.fullName}: $${unitPrice}`)
      }

      const item = {
        itemNumber: bayIndex + 1,
        quantity: bay.quantity || 1,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        designDetails: {
          frameType: pricingData.productName.fullName || "Unknown Frame Type",
          configuration: "Unknown",
          dimensions: pricingData.dimensions.widthMM && pricingData.dimensions.heightMM 
            ? `${pricingData.dimensions.widthMM} x ${pricingData.dimensions.heightMM} mm`
            : "Unknown",
          series: pricingData.productName.series,
          style: pricingData.productName.style,
          type: pricingData.productName.type,
          swing: pricingData.productName.swing,
        },
        appearance: {
          externalFinish: externalFinish,
          internalFinish: internalFinish,
        },
        glazing: {
          type: pricingData.glazing.constructedText || "Unknown",
          specs: pricingData.glazing.fullGlazingSpec || "Unknown",
          paneCount: pricingData.glazing.paneCount,
          lowECount: pricingData.glazing.lowECount,
          pricePerSqFt: pricingData.glazing.pricePerSqFt,
          totalCost: pricingData.glazing.totalCost,
        },
        hardware: {
          cylinderType: "Unknown",
          cylinderMaterial: "Unknown",
          handleType: "Unknown",
          handleFinish: "Unknown",
        },
        // Add sophisticated pricing breakdown
        pricingBreakdown: {
          dimensions: pricingData.dimensions,
          productPricing: pricingData.productPricing,
          glazingCost: pricingData.glazing.totalCost,
          productCost: pricingData.productPricing?.productPrice,
          totalEstimate: pricingData.totalEstimate,
          matchType: pricingData.productPricing?.matchType,
        },

        // Add images from bay
        images: bay.images || [],
      }

      quote.items.push(item)
    })
  }

  // Calculate summary with sophisticated pricing
  quote.summary.totalItems = quote.items.length
  quote.summary.totalQuantity = quote.items.reduce((sum, item) => sum + item.quantity, 0)
  quote.summary.subtotal = quote.items.reduce((sum, item) => sum + item.totalPrice, 0)
  quote.summary.tax = quote.summary.subtotal * (quote.project.taxPercent / 100)
  quote.summary.grandTotal = quote.summary.subtotal + quote.summary.tax

  console.log('📊 Quote Creation Summary:', {
    subtotal: quote.summary.subtotal.toFixed(2),
    tax: quote.summary.tax.toFixed(2),
    grandTotal: quote.summary.grandTotal.toFixed(2),
    itemCount: quote.summary.totalItems
  })

  return quote
}
