"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Grid, Check, Shield } from "lucide-react"

interface GridDivision {
  id: string
  itemId: string
  itemName: string
  horizontalLines: number
  verticalLines: number
}

interface ScreenSelection {
  id: string
  itemId: string
  itemName: string
  series: number
  needsScreen: boolean
}

interface GridDivisionPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (gridDivisions: GridDivision[], screenSelections: ScreenSelection[]) => void
  quotationItems: any[]
}

export function GridDivisionPopup({ isOpen, onClose, onConfirm, quotationItems }: GridDivisionPopupProps) {
  // Section navigation
  const [currentSection, setCurrentSection] = useState<'grid' | 'screen'>('grid')
  const [gridCompleted, setGridCompleted] = useState(false)
  const [screenCompleted, setScreenCompleted] = useState(false)
  
  // Grid division states
  const [wantsGridDivision, setWantsGridDivision] = useState<boolean | null>(null)
  const [gridDivisions, setGridDivisions] = useState<GridDivision[]>([])
  const [currentDivision, setCurrentDivision] = useState<Partial<GridDivision>>({})
  const [isAddingDivision, setIsAddingDivision] = useState(false)
  
  // Screen selection states
  const [wantsScreen, setWantsScreen] = useState<boolean | null>(null)
  const [screenSelections, setScreenSelections] = useState<ScreenSelection[]>([])
  const [nonScreenSeriesItems, setNonScreenSeriesItems] = useState<any[]>([])

  // Initialize screen selections on component mount
  useEffect(() => {
    const nonScreenSeries = quotationItems.filter(item => {
      const series = item.designDetails?.series
      return series && series !== 108 && series !== 118
    })
    setNonScreenSeriesItems(nonScreenSeries)
    
    // Initialize screen selections for non-screen series items
    const initialScreenSelections = nonScreenSeries.map(item => ({
      id: `screen-${item.itemNumber}`,
      itemId: item.itemNumber.toString(),
      itemName: item.designDetails?.frameType || "Unknown",
      series: item.designDetails?.series || 0,
      needsScreen: false
    }))
    setScreenSelections(initialScreenSelections)
  }, [quotationItems])

  const handleGridQuestionResponse = (response: boolean) => {
    setWantsGridDivision(response)
    if (response) {
      setIsAddingDivision(true)
    } else {
      setGridCompleted(true)
    }
  }

  const handleScreenQuestionResponse = (response: boolean) => {
    setWantsScreen(response)
    if (!response) {
      setScreenCompleted(true)
    }
  }

  const handleScreenSelection = (itemId: string, needsScreen: boolean) => {
    setScreenSelections(prev => 
      prev.map(selection => 
        selection.itemId === itemId 
          ? { ...selection, needsScreen }
          : selection
      )
    )
  }

  const handleItemSelect = (itemId: string) => {
    const selectedItem = quotationItems.find(item => item.itemNumber.toString() === itemId)
    setCurrentDivision({
      id: `grid-${Date.now()}`,
      itemId,
      itemName: selectedItem?.designDetails?.frameType || "Unknown Item",
      horizontalLines: 1,
      verticalLines: 1
    })
  }

  const handleAddDivision = () => {
    if (currentDivision.itemId && currentDivision.horizontalLines && currentDivision.verticalLines) {
      setGridDivisions([...gridDivisions, currentDivision as GridDivision])
      setCurrentDivision({})
      setIsAddingDivision(false)
    }
  }

  const handleRemoveDivision = (divisionId: string) => {
    setGridDivisions(gridDivisions.filter(div => div.id !== divisionId))
  }

  const handleAddAnother = () => {
    setIsAddingDivision(true)
    setCurrentDivision({})
  }

  const handleGridComplete = () => {
    setGridCompleted(true)
    setIsAddingDivision(false)
  }

  const handleScreenComplete = () => {
    setScreenCompleted(true)
  }

  const handleFinalSubmit = () => {
    // Create default screen selections for 108/118 series
    const defaultScreenSelections = quotationItems
      .filter(item => {
        const series = item.designDetails?.series
        return series === 108 || series === 118
      })
      .map(item => ({
        id: `screen-${item.itemNumber}`,
        itemId: item.itemNumber.toString(),
        itemName: item.designDetails?.frameType || "Unknown",
        series: item.designDetails?.series || 0,
        needsScreen: true
      }))

    // Combine with user selections
    const allScreenSelections = [...screenSelections, ...defaultScreenSelections]
    
    onConfirm(gridDivisions, allScreenSelections)
    onClose()
  }

  const handleClose = () => {
    // Reset state
    setCurrentSection('grid')
    setGridCompleted(false)
    setScreenCompleted(false)
    setWantsGridDivision(null)
    setGridDivisions([])
    setCurrentDivision({})
    setIsAddingDivision(false)
    setWantsScreen(null)
    setScreenSelections([])
    setNonScreenSeriesItems([])
    onClose()
  }

  // Reset screen states when entering screen section
  useEffect(() => {
    if (currentSection === 'screen' && gridCompleted) {
      setWantsScreen(null)
      setScreenCompleted(false)
    }
  }, [currentSection, gridCompleted])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid className="w-5 h-5" />
            Product Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your products for installation - grid divisions and screen options
          </DialogDescription>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentSection === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Grid Division</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentSection === 'screen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Screen Options</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* GRID DIVISION SECTION */}
          {currentSection === 'grid' && (
            <div className="space-y-6">
              {/* Grid Division Question */}
              {wantsGridDivision === null && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-4">Grid Division</h3>
                      <p className="text-gray-600 mb-6">
                        Do you want to divide any of your products into grids for installation?
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={() => handleGridQuestionResponse(true)}
                          className="px-8"
                          variant="default"
                        >
                          Yes, I want grid division
                        </Button>
                        <Button 
                          onClick={() => handleGridQuestionResponse(false)}
                          className="px-8"
                          variant="outline"
                        >
                          No, keep as is
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Adding New Division */}
              {isAddingDivision && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add Grid Division</CardTitle>
                    <CardDescription>
                      Select a product and specify how many lines it should be divided into
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Product</Label>
                      <Select onValueChange={handleItemSelect} value={currentDivision.itemId || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product to divide" />
                        </SelectTrigger>
                        <SelectContent>
                          {quotationItems.map((item) => (
                            <SelectItem key={item.itemNumber} value={item.itemNumber.toString()}>
                              Item {item.itemNumber}: {item.designDetails?.frameType || "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentDivision.itemId && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="horizontal-lines">Horizontal Lines</Label>
                            <Input
                              id="horizontal-lines"
                              type="number"
                              min="1"
                              max="10"
                              value={currentDivision.horizontalLines || 1}
                              onChange={(e) => setCurrentDivision({
                                ...currentDivision,
                                horizontalLines: parseInt(e.target.value) || 1
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="vertical-lines">Vertical Lines</Label>
                            <Input
                              id="vertical-lines"
                              type="number"
                              min="1"
                              max="10"
                              value={currentDivision.verticalLines || 1}
                              onChange={(e) => setCurrentDivision({
                                ...currentDivision,
                                verticalLines: parseInt(e.target.value) || 1
                              })}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleAddDivision} className="flex-1">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Division
                          </Button>
                          <Button onClick={() => setIsAddingDivision(false)} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Current Divisions List */}
              {gridDivisions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Grid Divisions</CardTitle>
                    <CardDescription>
                      Review and manage your configured grid divisions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {gridDivisions.map((division) => (
                        <div key={division.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{division.itemName}</div>
                            <div className="text-sm text-gray-600">
                              {division.horizontalLines} horizontal × {division.verticalLines} vertical lines
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {division.horizontalLines * division.verticalLines} grids
                            </Badge>
                            <Button
                              onClick={() => handleRemoveDivision(division.id)}
                              variant="ghost"
                              size="sm"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grid Division Action Buttons */}
              {wantsGridDivision && !isAddingDivision && (
                <div className="flex gap-3">
                  <Button onClick={handleAddAnother} variant="outline" className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Division
                  </Button>
                  <Button onClick={handleGridComplete} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Continue to Screens
                  </Button>
                </div>
              )}

              {/* Grid Division Complete Message */}
              {gridCompleted && !wantsGridDivision && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Grid Division Complete</h3>
                      <p className="text-green-700">No grid divisions needed for this quotation.</p>
                      <Button onClick={() => setCurrentSection('screen')} className="mt-4">
                        Continue to Screens
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {gridCompleted && wantsGridDivision && gridDivisions.length > 0 && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Grid Division Complete</h3>
                      <p className="text-green-700">You've configured {gridDivisions.length} product{gridDivisions.length > 1 ? 's' : ''} for grid division.</p>
                      <Button onClick={() => setCurrentSection('screen')} className="mt-4">
                        Continue to Screens
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* SCREEN SELECTION SECTION */}
          {currentSection === 'screen' && (
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex justify-start">
                <Button 
                  onClick={() => setCurrentSection('grid')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  ← Back to Grid Division
                </Button>
              </div>

              {/* Screen Selection Question */}
              {wantsScreen === null && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-4">Screen Options</h3>
                      {nonScreenSeriesItems.length > 0 ? (
                        <p className="text-gray-600 mb-6">
                          Do you need screens for your products? (Series 108 and 118 products already include screens)
                        </p>
                      ) : (
                        <p className="text-gray-600 mb-6">
                          All your products are from Series 108 or 118 and already include screens by default.
                        </p>
                      )}
                      <div className="flex gap-4 justify-center">
                        {nonScreenSeriesItems.length > 0 ? (
                          <>
                            <Button 
                              onClick={() => handleScreenQuestionResponse(true)}
                              className="px-8"
                              variant="default"
                            >
                              Yes, I need screens
                            </Button>
                            <Button 
                              onClick={() => handleScreenQuestionResponse(false)}
                              className="px-8"
                              variant="outline"
                            >
                              No, I don't need screens
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={() => setScreenCompleted(true)}
                            className="px-8"
                            variant="default"
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Individual Product Screen Selection */}
              {wantsScreen && nonScreenSeriesItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Products for Screens</CardTitle>
                    <CardDescription>
                      Choose which products need screens (Series 108 and 118 already have screens)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {screenSelections.map((selection) => (
                        <div key={selection.id} className="p-4 border rounded-lg">
                          <div className="space-y-3">
                            <div>
                              <div className="font-medium text-lg">{selection.itemName}</div>
                              <div className="text-sm text-gray-600">Series {selection.series}</div>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleScreenSelection(selection.itemId, true)}
                                variant={selection.needsScreen ? "default" : "outline"}
                                className="flex-1"
                              >
                                Yes, I need a screen
                              </Button>
                              <Button
                                onClick={() => handleScreenSelection(selection.itemId, false)}
                                variant={!selection.needsScreen ? "default" : "outline"}
                                className="flex-1"
                              >
                                No, I don't need a screen
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-3 pt-6">
                      <Button onClick={handleScreenComplete} className="flex-1">
                        <Check className="w-4 h-4 mr-2" />
                        Complete Screen Selection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Screen Selection Complete Message */}
              {screenCompleted && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-green-900 mb-2">Screen Selection Complete</h3>
                      <p className="text-green-700 mb-4">
                        {wantsScreen 
                          ? `You've configured screens for ${screenSelections.filter(s => s.needsScreen).length} products.`
                          : 'No screens needed for this quotation.'
                        }
                      </p>
                      <Button onClick={handleFinalSubmit} className="h-10 px-6">
                        <Check className="w-4 h-4 mr-2" />
                        Save Quotation & Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}
