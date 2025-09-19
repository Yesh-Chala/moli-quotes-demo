"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { extractCompletePricingDetails, type PricingData } from "@/lib/pricing-engine"

interface WindowCADData {
  isWindowCAD: boolean
  appType: string
  pdfBlob?: Blob
  projectJson?: any
  userAgent?: string
}

interface WindowCADDesignerProps {
  isOpen: boolean
  onClose: () => void
  onDataReceived: (data: { pdfBlob?: Blob; projectJson?: any }) => void
}

export function WindowCADDesigner({ isOpen, onClose, onDataReceived }: WindowCADDesignerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e && e.data && e.data.isWindowCAD && e.data.appType === "Retail") {
        console.log("WindowCAD data received:", e.data)

        const data: WindowCADData = e.data

        if (data.pdfBlob) {
          console.log("PDF Blob received:", data.pdfBlob)
          onDataReceived({ pdfBlob: data.pdfBlob })
        }

        if (data.projectJson) {
          console.log("Project JSON data:", data.projectJson)

          // Store raw data
          localStorage.setItem("windowCADProject", JSON.stringify(data.projectJson))
          console.log("Project data saved to localStorage")

          // Extract and log cleaned version
          const cleanedData = extractImportantDetails(data.projectJson)
          console.log("Parsed Important Quote Data:", cleanedData)

          // Save parsed data
          localStorage.setItem("parsedQuote", JSON.stringify(cleanedData))

          onDataReceived({ projectJson: cleanedData })
        }

        if (data.userAgent) {
          console.log("User Agent:", data.userAgent)
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onDataReceived])

  const sendToWindowCAD = (command: string, data: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: command,
          data: data,
        },
        "https://www.windowsoftware.co.uk",
      )
    }
  }

  const handleSaveQuote = () => {
    sendToWindowCAD("saveQuote", {})
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full h-[70vh] bg-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <iframe
          ref={iframeRef}
          src="https://www.windowsoftware.co.uk/windowcad7/?interface=retail&username=moliwindows"
          className="w-full h-full border-none"
          title="WindowCAD Designer"
        />

        <div className="absolute bottom-4 left-4">
          <button
            onClick={handleSaveQuote}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Quote
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced pricing extraction with sophisticated pricing engine
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

  // Process each bay (main quote items) with advanced pricing
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

      // Process frame collections to get detailed hardware specs (existing logic)
      if (bay.frameCollections && Array.isArray(bay.frameCollections)) {
        bay.frameCollections.forEach((collection: any) => {
          if (collection.frames && Array.isArray(collection.frames)) {
            collection.frames.forEach((frame: any) => {
              if (frame.apertures && Array.isArray(frame.apertures)) {
                frame.apertures.forEach((aperture: any) => {
                  if (aperture.sashFrames && Array.isArray(aperture.sashFrames)) {
                    aperture.sashFrames.forEach((sash: any) => {
                      // Extract hardware information
                      if (sash.hardware && Array.isArray(sash.hardware)) {
                        sash.hardware.forEach((hw: any) => {
                          if (hw.type === 'Cylinder') {
                            item.hardware.cylinderType = hw.style || 'Standard'
                            item.hardware.cylinderMaterial = hw.colour || 'Unknown'
                          } else if (hw.type === 'Door_handle') {
                            item.hardware.handleType = hw.style || 'Unknown'
                            item.hardware.handleFinish = hw.colour || 'Unknown'
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
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

  console.log('📊 Final Quote Summary:', {
    subtotal: quote.summary.subtotal.toFixed(2),
    tax: quote.summary.tax.toFixed(2),
    grandTotal: quote.summary.grandTotal.toFixed(2),
    itemCount: quote.summary.totalItems
  })

  return quote
}
