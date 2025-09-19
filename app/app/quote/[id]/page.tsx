"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getQuotationById, updateQuotationItem, deleteQuotationItem, type Quotation } from "@/lib/data-store"
import { requireRole } from "@/lib/auth"
import { ArrowLeft, Download, Calendar, DollarSign, Edit, Trash2, Clock, MessageSquare, History, Grid, Shield } from "lucide-react"
import { EditItemDialog } from "@/components/edit-item-dialog"
import { DeleteItemDialog } from "@/components/delete-item-dialog"

// Helper function to convert base64 to image data URL
const convertBase64ToImageUrl = (base64Data: string): string => {
  // Remove any existing data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '')
  return `data:image/png;base64,${cleanBase64}`
}

export default function QuotationDetailPage() {
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string

  useEffect(() => {
    try {
      requireRole("DEALER")
      loadQuotation()
    } catch {
      router.push("/")
    }
  }, [quotationId, router])

  const loadQuotation = () => {
    const quotationData = getQuotationById(quotationId)
    if (!quotationData) {
      router.push("/app/home")
      return
    }
    setQuotation(quotationData)
  }

  const handleDownloadPDF = () => {
    if (quotation?.pdfUrl) {
      const link = document.createElement("a")
      link.href = quotation.pdfUrl
      link.download = `${quotation.name}.pdf`
      link.click()
    } else {
      alert("PDF not available for this quotation")
    }
  }

  const handleEditItem = (item: any, index: number) => {
    setEditingItem({ ...item, _index: index })
    setIsEditDialogOpen(true)
  }

  const handleDeleteItem = (item: any, index: number) => {
    setDeletingItem({ ...item, _index: index })
    setIsDeleteDialogOpen(true)
  }

  const handleSaveItem = (updatedItem: any) => {
    if (!quotation || editingItem === null) return

    const itemIndex = editingItem._index
    const updatedQuotation = updateQuotationItem(quotationId, itemIndex, updatedItem)
    
    if (updatedQuotation) {
      setQuotation(updatedQuotation)
      console.log("✅ Item updated successfully")
    } else {
      alert("Failed to update item. Please try again.")
    }
  }

  const handleConfirmDelete = () => {
    if (!quotation || deletingItem === null) return

    const itemIndex = deletingItem._index
    const updatedQuotation = deleteQuotationItem(quotationId, itemIndex)
    
    if (updatedQuotation) {
      setQuotation(updatedQuotation)
      console.log("✅ Item deleted successfully")
    } else {
      alert("Failed to delete item. Please try again.")
    }
  }

  if (!quotation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading quotation...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/app/home")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{quotation.name}</h1>
              <p className="text-gray-600">Quotation Details</p>
            </div>
            {quotation.pdfUrl && (
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quotation Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{quotation.name}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created: {quotation.createdAt.toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />${quotation.totals.grandTotal.toLocaleString()}
                  </span>
                </CardDescription>
              </div>
              <Badge variant="outline">Quote #{quotation.id}</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Pricing Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pricing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Subtotal</p>
                  <p className="text-2xl font-bold">${quotation.totals.subtotal.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Tax</p>
                  <p className="text-2xl font-bold">${quotation.totals.tax.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Grand Total</p>
                  <p className="text-2xl font-bold text-green-600">${quotation.totals.grandTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Division Summary */}
        {quotation.gridDivisions && quotation.gridDivisions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid className="w-5 h-5" />
                Grid Division Summary
              </CardTitle>
              <CardDescription>Products configured for grid division installation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.gridDivisions.map((division, index) => (
                  <div key={division.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{division.itemName}</div>
                      <div className="text-sm text-gray-600">
                        {division.horizontalLines} horizontal × {division.verticalLines} vertical lines
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {division.horizontalLines * division.verticalLines} grids
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Grid Divisions:</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {quotation.gridDivisions.length} products
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Screen Selection Summary */}
        {quotation.screenSelections && quotation.screenSelections.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Screen Configuration Summary
              </CardTitle>
              <CardDescription>Products configured for screen installation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.screenSelections.map((selection, index) => (
                  <div key={selection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{selection.itemName}</div>
                      <div className="text-sm text-gray-600">Series {selection.series}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={selection.needsScreen ? "default" : "secondary"}
                        className="text-lg px-3 py-1"
                      >
                        {selection.needsScreen ? 'Screen Included' : 'No Screen'}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Screen Configurations:</span>
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {quotation.screenSelections.length} products
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status and Notes Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Project Status & Notes</CardTitle>
            <CardDescription>Current status and important notes about this quotation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Current Status */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Current Status</h3>
                    <Badge 
                      variant={quotation.status.stage === 7 ? "default" : "outline"}
                      className={quotation.status.stage === 7 ? "bg-green-600" : ""}
                    >
                      Stage {quotation.status.stage}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2">{quotation.status.notes}</p>
                  <p className="text-sm text-gray-500">
                    Last updated: {quotation.status.changedAt.toLocaleDateString()} at {quotation.status.changedAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Quotation Notes */}
              {quotation.notes && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Quotation Notes</h3>
                    <p className="text-gray-700">{quotation.notes}</p>
                  </div>
                </div>
              )}

              {/* Status History */}
              {quotation.statusHistory && quotation.statusHistory.length > 1 && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <History className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3">Status History</h3>
                    <div className="space-y-3">
                      {quotation.statusHistory.slice().reverse().map((status, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4 pb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Stage {status.stage}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {status.changedAt.toLocaleDateString()} at {status.changedAt.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{status.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Construction-Friendly Line Items with Images */}
        {quotation.lineItems && quotation.lineItems.length > 0 && (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* LEFT SIDE - Details (3/5 width) */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Project Line Items</CardTitle>
                  <CardDescription>Detailed specifications and pricing for each component</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {quotation.lineItems.map((item: any, index: number) => (
                      <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    
                    {/* ITEM HEADER - Big and Clear */}
                    <div className="bg-gray-100 border-b-2 border-gray-300 p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-2xl font-bold mb-2 text-gray-900">ITEM #{item.itemNumber}</h3>
                          <h4 className="text-lg font-medium text-gray-700">{item.designDetails?.frameType || `Component ${index + 1}`}</h4>
                          <p className="text-gray-600 mt-2">Qty: {item.quantity} units</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">${(item.totalPrice || 0).toLocaleString()}</div>
                            <div className="text-gray-600 text-sm">Total Cost</div>
                          </div>
                          {/* Edit and Delete buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item, index)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item, index)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* SPECIFICATIONS SECTION */}
                      <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        
                        {/* LEFT: PRODUCT SPECIFICATIONS */}
                        <div className="bg-white border border-gray-200 p-5 rounded-lg">
                          <h5 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                            📋 PRODUCT SPECIFICATIONS
                          </h5>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Series</label>
                                <div className="text-lg font-semibold text-gray-900">{item.designDetails?.series || "Standard"}</div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Style</label>
                                <div className="text-lg font-semibold text-gray-900">{item.designDetails?.style || "N/A"}</div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                              <div className="text-lg font-semibold text-gray-900">{item.designDetails?.type || "N/A"}</div>
                            </div>
                            
                            {item.designDetails?.swing && (
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Operation</label>
                                <div className="text-lg font-semibold text-gray-900">{item.designDetails.swing}</div>
                              </div>
                            )}
                            
                            <div>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dimensions</label>
                              <div className="text-lg font-semibold text-gray-900">{item.designDetails?.dimensions || "N/A"}</div>
                            </div>

                            {/* Grid Division Information */}
                            {item.gridDivision && (
                              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Grid className="w-5 h-5 text-blue-600" />
                                  <label className="text-sm font-medium text-blue-800 uppercase tracking-wide">Grid Division</label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm text-blue-700">Horizontal Lines</div>
                                    <div className="text-lg font-semibold text-blue-900">{item.gridDivision.horizontalLines}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-blue-700">Vertical Lines</div>
                                    <div className="text-lg font-semibold text-blue-900">{item.gridDivision.verticalLines}</div>
                                  </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-blue-200">
                                  <div className="text-sm text-blue-700">Total Grids</div>
                                  <div className="text-xl font-bold text-blue-900">{item.gridDivision.totalGrids}</div>
                                </div>
                              </div>
                            )}

                            {/* Screen Configuration Information */}
                            {item.screenConfiguration && (
                              <div className={`mt-4 p-4 border rounded-lg ${
                                item.screenConfiguration.needsScreen 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className={`w-5 h-5 ${
                                    item.screenConfiguration.needsScreen ? 'text-green-600' : 'text-gray-600'
                                  }`} />
                                  <label className={`text-sm font-medium uppercase tracking-wide ${
                                    item.screenConfiguration.needsScreen ? 'text-green-800' : 'text-gray-800'
                                  }`}>
                                    Screen Configuration
                                  </label>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className={`text-lg font-semibold ${
                                      item.screenConfiguration.needsScreen ? 'text-green-900' : 'text-gray-900'
                                    }`}>
                                      {item.screenConfiguration.needsScreen ? 'Screen Included' : 'No Screen'}
                                    </div>
                                    <div className={`text-sm ${
                                      item.screenConfiguration.needsScreen ? 'text-green-700' : 'text-gray-700'
                                    }`}>
                                      Series {item.screenConfiguration.series}
                                    </div>
                                  </div>
                                  <Badge variant={item.screenConfiguration.needsScreen ? "default" : "secondary"}>
                                    {item.screenConfiguration.needsScreen ? 'Included' : 'Not Required'}
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RIGHT: MATERIALS & GLAZING */}
                        <div className="space-y-6">
                          
                          {/* FINISHES */}
                          <div className="bg-white border border-gray-200 p-5 rounded-lg">
                            <h6 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                              🎨 FINISHES
                            </h6>
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Exterior</label>
                                <div className="text-base font-semibold text-gray-900">{item.appearance?.externalFinish || "Standard"}</div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interior</label>
                                <div className="text-base font-semibold text-gray-900">{item.appearance?.internalFinish || "Standard"}</div>
                              </div>
                            </div>
                          </div>

                          {/* GLAZING */}
                          <div className="bg-white border border-gray-200 p-5 rounded-lg">
                            <h6 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                              🔍 GLAZING
                            </h6>
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Glass Type</label>
                                <div className="text-base font-semibold text-gray-900">{item.glazing?.type || "Standard"}</div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {item.glazing?.paneCount && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Panes</label>
                                    <div className="text-base font-semibold text-gray-900">{item.glazing.paneCount}</div>
                                  </div>
                                )}
                                {item.glazing?.lowECount && item.glazing.lowECount > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Low-E</label>
                                    <div className="text-base font-semibold text-gray-900">{item.glazing.lowECount}x Coating</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* COST BREAKDOWN SECTION */}
                      {item.pricingBreakdown && (item.pricingBreakdown.productCost || item.pricingBreakdown.glazingCost) && (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                          <h5 className="text-xl font-bold text-gray-900 mb-5 text-center">
                            💰 COST BREAKDOWN
                          </h5>
                          
                          <div className="grid md:grid-cols-3 gap-6">
                            {/* SIZE INFO */}
                            {item.pricingBreakdown.dimensions?.squareFeet && (
                              <div className="text-center">
                                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                  <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {item.pricingBreakdown.dimensions.squareFeet.toFixed(1)}
                                  </div>
                                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">Square Feet</div>
                                </div>
                              </div>
                            )}

                            {/* COST COMPONENTS */}
                            <div className="md:col-span-2">
                              <div className="space-y-3">
                                {item.pricingBreakdown.productCost && (
                                  <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                    <div>
                                      <div className="font-semibold text-gray-900">Frame & Hardware</div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                      ${parseFloat(item.pricingBreakdown.productCost).toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                
                                {item.pricingBreakdown.glazingCost && (
                                  <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                    <div>
                                      <div className="font-semibold text-gray-900">Glass & Glazing</div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                      ${parseFloat(item.pricingBreakdown.glazingCost).toLocaleString()}
                                    </div>
                                  </div>
                                )}

                                {/* UNIT TOTAL */}
                                <div className="border-t-2 border-gray-300 pt-3">
                                  <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded-lg">
                                    <div className="text-lg font-semibold">UNIT TOTAL</div>
                                    <div className="text-2xl font-bold">
                                      ${(item.unitPrice || 0).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE - Images (2/5 width) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Images</CardTitle>
              <CardDescription>Visual representations of each component</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {quotation.lineItems.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Image Header */}
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-900">ITEM #{item.itemNumber}</h4>
                      <p className="text-sm text-gray-600 truncate">{item.designDetails?.frameType || `Component ${index + 1}`}</p>
                    </div>
                    
                    {/* Image Display */}
                    <div className="p-4">
                      {/* Check for images array from bay */}
                      {item.images && item.images.length > 0 ? (
                        <div className="space-y-3">
                          {item.images.map((imageObj: any, imageIndex: number) => {
                            // Check for various possible base64 properties
                            const base64Data = imageObj.data || imageObj.base64 || imageObj.imageData || imageObj.pngData || imageObj.src
                            
                            // Debug log to see what's in the image object
                            console.log('Image object:', imageObj)
                            
                            if (base64Data) {
                              return (
                                <div key={imageIndex} className="bg-white">
                                  <img 
                                    src={convertBase64ToImageUrl(base64Data)}
                                    alt={`${item.designDetails?.frameType || 'Component'} - Item ${item.itemNumber} - Image ${imageIndex + 1}`}
                                    className="w-full h-auto rounded border border-gray-200"
                                    onError={(e) => {
                                      // Fallback if image fails to load
                                      (e.target as HTMLImageElement).style.display = 'none'
                                      const parent = (e.target as HTMLImageElement).parentElement
                                      if (parent) {
                                        parent.innerHTML = '<div class="flex items-center justify-center h-32 bg-gray-100 rounded border border-gray-200"><span class="text-gray-500">Image failed to load</span></div>'
                                      }
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-2 text-center">
                                    Image {imageIndex + 1} - {item.designDetails?.dimensions || 'Component Image'}
                                  </p>
                                </div>
                              )
                            } else {
                              // Show image bounds info if no base64 data
                              return (
                                <div key={imageIndex} className="bg-gray-50 p-3 rounded border border-gray-200">
                                  <p className="text-xs text-gray-600 mb-2">Image {imageIndex + 1} Properties:</p>
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <p><strong>Internal:</strong> {imageObj.isInternal ? 'Yes' : 'No'}</p>
                                    {imageObj.bayBoundsMin && (
                                      <p><strong>Bounds:</strong> [{imageObj.bayBoundsMin[0]?.toFixed(1)}, {imageObj.bayBoundsMin[1]?.toFixed(1)}] to [{imageObj.bayBoundsMax[0]?.toFixed(1)}, {imageObj.bayBoundsMax[1]?.toFixed(1)}]</p>
                                    )}
                                  </div>
                                  <p className="text-xs text-orange-600 mt-2">
                                    ⚠️ Base64 data not found in expected properties
                                  </p>
                                </div>
                              )
                            }
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-gray-100 rounded border border-gray-200">
                          <span className="text-gray-500">No images available</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        )}

        {/* Edit and Delete Dialogs */}
        <EditItemDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setEditingItem(null)
          }}
          onSave={handleSaveItem}
          item={editingItem}
        />

        <DeleteItemDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setDeletingItem(null)
          }}
          onConfirm={handleConfirmDelete}
          item={deletingItem}
        />
      </div>
    </div>
  )
}
