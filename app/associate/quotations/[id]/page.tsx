"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getQuotationById,
  getDealerById,
  getAssociateById,
  updateQuotationStatus,
  updateQuotationNotes,
} from "@/lib/data-store"
import { getAuthUser, clearAuthUser } from "@/lib/auth"
import type { Quotation, Dealer, Associate } from "@/lib/data-store"
import { ArrowLeft, FileText, Calendar, DollarSign, User, Building2, Mail, Phone, Percent, Plus, LogOut, History, MessageSquare } from "lucide-react"

export default function AssociateQuotationDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const quotationId = params.id as string
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [dealer, setDealer] = useState<Dealer | null>(null)
  const [associate, setAssociate] = useState<Associate | null>(null)
  const [commission, setCommission] = useState(0)
  const [notes, setNotes] = useState("")
  const [newStage, setNewStage] = useState<number>(1)
  const [statusNotes, setStatusNotes] = useState("")
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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

    const quotationData = getQuotationById(quotationId)
    if (!quotationData) {
      router.push("/associate/quotations")
      return
    }

    const dealerData = getDealerById(quotationData.dealerId)
    if (!dealerData || dealerData.associateId !== associateData.id) {
      router.push("/associate/quotations")
      return
    }

    setAssociate(associateData)
    setQuotation(quotationData)
    setDealer(dealerData)
    setNotes(quotationData.notes)
    setNewStage(quotationData.status.stage)

    // Calculate commission
    const commissionAmount = quotationData.totals.grandTotal * (associateData.commissionPercentage / 100)
    setCommission(commissionAmount)
    setLoading(false)
  }, [quotationId, router])

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  const handleSaveNotes = () => {
    if (!quotation) return

    updateQuotationNotes(quotation.id, notes)

    // Refresh quotation data
    const updatedQuotation = getQuotationById(quotation.id)
    if (updatedQuotation) {
      setQuotation(updatedQuotation)
    }
  }

  const handleStatusChange = () => {
    if (!quotation || !associate) return

    updateQuotationStatus(quotation.id, newStage, statusNotes, associate.id)

    // Refresh quotation data
    const updatedQuotation = getQuotationById(quotation.id)
    if (updatedQuotation) {
      setQuotation(updatedQuotation)
      setNewStage(updatedQuotation.status.stage)
    }

    setStatusNotes("")
    setIsStatusDialogOpen(false)
  }

  const getStatusColor = (stage: number) => {
    switch (stage) {
      case 1: return "bg-yellow-100 text-yellow-800"
      case 2: return "bg-blue-100 text-blue-800"
      case 3: return "bg-purple-100 text-purple-800"
      case 4: return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (stage: number) => {
    switch (stage) {
      case 1: return "Draft"
      case 2: return "Sent to Customer"
      case 3: return "Under Review"
      case 4: return "Approved"
      default: return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!quotation || !dealer || !associate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quotation not found</h1>
          <Button onClick={() => router.push("/associate")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Moli Windows</h1>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/associate")} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create New Dealer
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => router.push(`/associate/dealers/${dealer.id}`)} 
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dealer
            </Button>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{quotation.name}</h2>
          <p className="text-gray-600 mt-2">Customer: {quotation.customerName} • Quote #{quotation.id.split('-')[1]}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left 70% - Static Information */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quotation Overview */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Quotation Overview</CardTitle>
                    <CardDescription className="mt-2">
                      Created on {quotation.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(quotation.status.stage)}>
                    {getStatusText(quotation.status.stage)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-2xl font-bold">${quotation.totals.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Tax</p>
                      <p className="text-2xl font-bold">${quotation.totals.tax.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Grand Total</p>
                      <p className="text-2xl font-bold text-green-600">${quotation.totals.grandTotal.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {quotation.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{quotation.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            {quotation.lineItems && quotation.lineItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quotation.lineItems.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name || `Item ${index + 1}`}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                        </div>
                        <p className="font-semibold">${(item.price || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dealer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Dealer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Name</p>
                    <p className="font-semibold">{dealer.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact Person</p>
                    <p>{dealer.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{dealer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{dealer.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right 30% - Actions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Status Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Change Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Badge className={`${getStatusColor(quotation.status.stage)} text-lg px-3 py-1`}>
                      {getStatusText(quotation.status.stage)}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">{quotation.status.notes}</p>
                  </div>
                  
                  <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        Change Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Quote Status</DialogTitle>
                        <DialogDescription>Update the status and add notes about the change</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="stage">New Stage</Label>
                          <Select
                            value={newStage.toString()}
                            onValueChange={(value) => setNewStage(Number.parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
                                <SelectItem key={stage} value={stage.toString()}>
                                  Stage {stage}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="statusNotes">Status Change Notes</Label>
                          <Textarea
                            id="statusNotes"
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            placeholder="Describe what was done and what you're waiting for..."
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleStatusChange} disabled={!statusNotes.trim()}>
                          Update Status
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* View Edit History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  View Edit History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setIsHistoryDialogOpen(true)}
                >
                  <History className="w-4 h-4 mr-2" />
                  View History ({quotation.statusHistory.length})
                </Button>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-4">
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this quotation..."
                      rows={6}
                    />
                    <Button onClick={handleSaveNotes} className="w-full">
                      Save Notes
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Commission Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Your Commission
                </CardTitle>
                <CardDescription>{associate.commissionPercentage}% of total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${commission.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Status History</DialogTitle>
              <DialogDescription>Complete history of status changes for this quotation</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {quotation.statusHistory.map((status, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getStatusColor(status.stage)}>
                        {getStatusText(status.stage)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {status.changedAt.toLocaleDateString()} at {status.changedAt.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{status.notes}</p>
                    <p className="text-xs text-gray-500 mt-1">Changed by: {status.changedBy}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button onClick={() => setIsHistoryDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
