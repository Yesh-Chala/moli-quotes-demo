"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  getQuotationsByAssociateId,
  getAssociateById,
  getDealerById,
  updateQuotationStatus,
  updateQuotationNotes,
} from "@/lib/data-store"
import { getAuthUser } from "@/lib/auth"
import type { Associate, Quotation } from "@/lib/data-store"
import { ArrowLeft, FileText, Calendar, Edit, MessageSquare } from "lucide-react"

export default function AssociateQuotations() {
  const router = useRouter()
  const [associate, setAssociate] = useState<Associate | null>(null)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState({ stage: 1, notes: "" })
  const [quotationNotes, setQuotationNotes] = useState("")

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
    const associateQuotations = getQuotationsByAssociateId(associateData.id)
    setQuotations(associateQuotations)
  }, [router])

  const handleStatusUpdate = () => {
    if (!selectedQuotation || !associate) return

    updateQuotationStatus(selectedQuotation.id, newStatus.stage, newStatus.notes, associate.id)

    // Refresh quotations
    const updatedQuotations = getQuotationsByAssociateId(associate.id)
    setQuotations(updatedQuotations)

    setIsStatusDialogOpen(false)
    setSelectedQuotation(null)
    setNewStatus({ stage: 1, notes: "" })
  }

  const handleNotesUpdate = () => {
    if (!selectedQuotation || !associate) return

    updateQuotationNotes(selectedQuotation.id, quotationNotes)

    // Refresh quotations
    const updatedQuotations = getQuotationsByAssociateId(associate.id)
    setQuotations(updatedQuotations)

    setIsNotesDialogOpen(false)
    setSelectedQuotation(null)
    setQuotationNotes("")
  }

  const openStatusDialog = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setNewStatus({ stage: quotation.status.stage, notes: "" })
    setIsStatusDialogOpen(true)
  }

  const openNotesDialog = (quotation: Quotation) => {
    setSelectedQuotation(quotation)
    setQuotationNotes(quotation.notes)
    setIsNotesDialogOpen(true)
  }

  if (!associate) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/associate")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Quotations</h1>
            <p className="text-gray-600">Manage quotations from your dealers</p>
          </div>
        </div>

        <div className="grid gap-6">
          {quotations.map((quotation) => {
            const dealer = getDealerById(quotation.dealerId)
            const commission = quotation.totals.grandTotal * (associate.commissionPercentage / 100)

            return (
              <Card key={quotation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{quotation.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {quotation.createdAt.toLocaleDateString()}
                        </span>
                        <span>Dealer: {dealer?.name}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Stage {quotation.status.stage}</Badge>
                      <Button onClick={() => openStatusDialog(quotation)} size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Update Status
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Subtotal</p>
                      <p className="text-lg">${quotation.totals.subtotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tax</p>
                      <p className="text-lg">${quotation.totals.tax.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Grand Total</p>
                      <p className="text-lg font-semibold">${quotation.totals.grandTotal.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Your Commission</p>
                      <p className="text-lg font-semibold text-green-600">${commission.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Status</p>
                      <p className="text-sm">{quotation.status.notes}</p>
                      <p className="text-xs text-gray-400">Updated {quotation.status.changedAt.toLocaleDateString()}</p>
                    </div>

                    {quotation.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Quote Notes</p>
                        <p className="text-sm">{quotation.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={() => openNotesDialog(quotation)} size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Edit Notes
                      </Button>
                      {quotation.statusHistory.length > 0 && (
                        <Button size="sm" variant="outline">
                          View History ({quotation.statusHistory.length})
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {quotations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No quotations found</p>
              <Button onClick={() => router.push("/associate/dealers")}>Manage Dealers</Button>
            </CardContent>
          </Card>
        )}

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Quotation Status</DialogTitle>
              <DialogDescription>Change the status stage and add notes about what was done.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="status-stage">Status Stage</Label>
                <Select
                  value={newStatus.stage.toString()}
                  onValueChange={(value) => setNewStatus({ ...newStatus, stage: Number.parseInt(value) })}
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
                <Label htmlFor="status-notes">Status Notes</Label>
                <Textarea
                  id="status-notes"
                  value={newStatus.notes}
                  onChange={(e) => setNewStatus({ ...newStatus, notes: e.target.value })}
                  placeholder="What was done? What are you waiting for?"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate}>Update Status</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Notes Update Dialog */}
        <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Quotation Notes</DialogTitle>
              <DialogDescription>Add or update notes for this quotation.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quotation-notes">Quotation Notes</Label>
                <Textarea
                  id="quotation-notes"
                  value={quotationNotes}
                  onChange={(e) => setQuotationNotes(e.target.value)}
                  placeholder="Add notes about this quotation..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleNotesUpdate}>Save Notes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
