"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getDealersByAssociateId, getQuotationsByAssociateId, getAssociateById, createDealer } from "@/lib/data-store"
import { getAuthUser, clearAuthUser } from "@/lib/auth"
import type { Associate, Dealer, Quotation } from "@/lib/data-store"
import { Plus, LogOut, Building2, FileText, DollarSign, Eye, EyeOff, Copy, Check } from "lucide-react"

export default function AssociateDashboard() {
  const router = useRouter()
  const [associate, setAssociate] = useState<Associate | null>(null)
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [totalCommission, setTotalCommission] = useState(0)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDealer, setNewDealer] = useState({
    userId: "",
    name: "",
    businessName: "",
    contact: "",
    email: "",
    phone: "",
    password: "",
  })
  const [createdDealer, setCreatedDealer] = useState<Dealer | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const loadAssociateData = () => {
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

    // Load dealers and quotations for this associate
    const associateDealers = getDealersByAssociateId(associateData.id)
    const associateQuotations = getQuotationsByAssociateId(associateData.id)

    setDealers(associateDealers)
    setQuotations(associateQuotations)

    // Calculate total commission
    const commission = associateQuotations.reduce((total, quote) => {
      return total + quote.totals.grandTotal * (associateData.commissionPercentage / 100)
    }, 0)
    setTotalCommission(commission)
  }

  useEffect(() => {
    loadAssociateData()
  }, [router])

  if (!associate) {
    return <div>Loading...</div>
  }

  const handleLogout = () => {
    clearAuthUser()
    router.push("/")
  }

  const handleCreateDealer = (e: React.FormEvent) => {
    e.preventDefault()

    if (!associate || !newDealer.userId || !newDealer.name || !newDealer.businessName || !newDealer.contact || !newDealer.email || !newDealer.phone || !newDealer.password) {
      return
    }

    try {
      const dealer = createDealer({
        ...newDealer,
        associateId: associate.id,
      })
      
      setCreatedDealer(dealer)
      loadAssociateData()
      setNewDealer({ userId: "", name: "", businessName: "", contact: "", email: "", phone: "", password: "" })
    } catch (error) {
      console.error("Error creating dealer:", error)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
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
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Dealer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Dealer</DialogTitle>
                    <DialogDescription>
                      Add a new dealer to your network. They will be able to log in and create quotations.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateDealer} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dealer-user-id">Dealer ID</Label>
                        <Input
                          id="dealer-user-id"
                          value={newDealer.userId}
                          onChange={(e) => setNewDealer({ ...newDealer, userId: e.target.value })}
                          placeholder="dealer004"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input
                          id="business-name"
                          value={newDealer.businessName}
                          onChange={(e) => setNewDealer({ ...newDealer, businessName: e.target.value })}
                          placeholder="ABC Windows & Doors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Contact Person</Label>
                      <Input
                        id="contact-name"
                        value={newDealer.name}
                        onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dealer-email">Email</Label>
                        <Input
                          id="dealer-email"
                          type="email"
                          value={newDealer.email}
                          onChange={(e) => setNewDealer({ ...newDealer, email: e.target.value })}
                          placeholder="john@abcwindows.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dealer-phone">Phone</Label>
                        <Input
                          id="dealer-phone"
                          value={newDealer.phone}
                          onChange={(e) => setNewDealer({ ...newDealer, phone: e.target.value })}
                          placeholder="+1-555-0104"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dealer-password">Temporary Password</Label>
                      <div className="relative">
                        <Input
                          id="dealer-password"
                          type={showPassword ? "text" : "password"}
                          value={newDealer.password}
                          onChange={(e) => setNewDealer({ ...newDealer, password: e.target.value })}
                          placeholder="Enter temporary password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Dealer</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
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
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {associate.name}</h2>
          <p className="text-gray-600 mt-2">Manage your dealers and track quotations</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dealers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dealers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quotations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${quotations.reduce((sum, q) => sum + q.totals.grandTotal, 0).toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalCommission.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Dealers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Your Dealers
            </CardTitle>
            <CardDescription>Manage and track your assigned dealers</CardDescription>
          </CardHeader>
          <CardContent>
            {dealers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dealer Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Total Quotations</TableHead>
                    <TableHead>Estimated Value</TableHead>
                    <TableHead>Your Commission</TableHead>
                    <TableHead>Password Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealers.map((dealer) => {
                    const dealerQuotations = quotations.filter(q => q.dealerId === dealer.id)
                    const totalValue = dealerQuotations.reduce((sum, q) => sum + q.totals.grandTotal, 0)
                    const commission = totalValue * (associate.commissionPercentage / 100)

                    return (
                      <TableRow key={dealer.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{dealer.businessName}</TableCell>
                        <TableCell>{dealer.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{dealerQuotations.length}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${totalValue.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-semibold">${commission.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={dealer.passwordChanged ? "default" : "destructive"}>
                            {dealer.passwordChanged ? "Changed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => router.push(`/associate/dealers/${dealer.id}`)}
                            size="sm"
                            variant="outline"
                          >
                            View Quotes
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No dealers yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first dealer.</p>
                <Button onClick={() => router.push("/associate/dealers/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Dealer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Dialog for Created Dealer */}
        <Dialog open={!!createdDealer} onOpenChange={() => setCreatedDealer(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Dealer Created Successfully!
              </DialogTitle>
              <DialogDescription>
                Here are the login credentials for the new dealer. Make sure to share these securely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ Important: These are temporary credentials</p>
                <p className="text-sm text-yellow-700">
                  The dealer should change their password on first login. 
                  {createdDealer?.passwordChanged ? " Password has been changed." : " Password change is pending."}
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dealer ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={createdDealer?.userId || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdDealer?.userId || "", "userId")}
                    >
                      {copiedField === "userId" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Temporary Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={createdDealer?.password || ""}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(createdDealer?.password || "", "password")}
                    >
                      {copiedField === "password" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setCreatedDealer(null)}>
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
