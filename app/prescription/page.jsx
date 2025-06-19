"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import  Badge  from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Brain, Check, Edit3, Plus, Save, Trash2, User, Clock, Pill, AlertTriangle } from "lucide-react"

export default function PrescriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [doctorNotes, setDoctorNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/signin")
      return
    }

    // Simulate AI prescription generation
    const generateAIPrescription = async () => {
      setIsLoading(true)

      const patientId = searchParams.get("patientId")
      const symptoms = searchParams.get("symptoms") || ""

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock AI-generated prescription based on symptoms
      const aiSuggestions = [
        {
          id: "1",
          name: "Acetaminophen",
          dosage: "500mg",
          frequency: "Every 6 hours",
          duration: "5 days",
          instructions: "Take with food to avoid stomach upset",
          aiSuggested: true,
        },
        {
          id: "2",
          name: "Ibuprofen",
          dosage: "400mg",
          frequency: "Every 8 hours",
          duration: "3 days",
          instructions: "Take after meals",
          aiSuggested: true,
        },
        {
          id: "3",
          name: "Vitamin C",
          dosage: "1000mg",
          frequency: "Once daily",
          duration: "7 days",
          instructions: "Take with breakfast",
          aiSuggested: true,
        },
      ]

      setPrescriptionData({
        patientName: "John Smith", // In real app, fetch from patient data
        symptoms: decodeURIComponent(symptoms),
        aiSuggestions,
        finalPrescription: [...aiSuggestions], // Start with AI suggestions
        doctorNotes: "",
      })

      setIsLoading(false)
    }

    generateAIPrescription()
  }, [user, router, searchParams])

  const handleMedicineEdit = (medicineId, updates) => {
    if (!prescriptionData) return

    const updatedPrescription = prescriptionData.finalPrescription.map((med) =>
      med.id === medicineId
        ? { ...med, ...updates, aiSuggested: false } // Mark as doctor-modified
        : med,
    )

    setPrescriptionData({
      ...prescriptionData,
      finalPrescription: updatedPrescription,
    })
    setEditingMedicine(null)
  }

  const handleAddMedicine = () => {
    if (!prescriptionData) return

    const newMedicine = {
      id: Date.now().toString(),
      name: "New Medicine",
      dosage: "100mg",
      frequency: "Once daily",
      duration: "7 days",
      instructions: "Take as directed",
      aiSuggested: false,
    }

    setPrescriptionData({
      ...prescriptionData,
      finalPrescription: [...prescriptionData.finalPrescription, newMedicine],
    })
    setEditingMedicine(newMedicine.id)
  }

  const handleRemoveMedicine = (medicineId) => {
    if (!prescriptionData) return

    setPrescriptionData({
      ...prescriptionData,
      finalPrescription: prescriptionData.finalPrescription.filter((med) => med.id !== medicineId),
    })
  }

  const handleSavePrescription = async () => {
    if (!prescriptionData) return

    setIsSaving(true)

    // Simulate saving to MCP server and learning from doctor's modifications
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In real implementation, this would:
    // 1. Save the final prescription to the database
    // 2. Store doctor's modifications for AI learning
    // 3. Update the personalized recommendation model

    setIsSaving(false)

    // Show success message and redirect
    alert("Prescription saved successfully! The AI system has learned from your modifications.")
    router.push("/dashboard")
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating AI Prescription</h2>
          <p className="text-gray-600">Analyzing symptoms and generating recommendations...</p>
        </div>
      </div>
    )
  }

  if (!prescriptionData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">AI Prescription Generator</h1>
              </div>
            </div>
            <Button onClick={handleSavePrescription} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Prescription"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <CardTitle>{prescriptionData.patientName}</CardTitle>
                  <CardDescription>Prescription Generation Session</CardDescription>
                </div>
              </div>
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Current Symptoms</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{prescriptionData.symptoms}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ai-suggestions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="final-prescription">Final Prescription</TabsTrigger>
            <TabsTrigger value="learning-insights">AI Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-suggestions" className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                The AI has analyzed the symptoms and generated the following medicine recommendations. You can modify
                these suggestions in the Final Prescription tab.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              {prescriptionData.aiSuggestions.map((medicine) => (
                <Card key={medicine.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Pill className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            AI Suggested
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Dosage:</span>
                            <p className="font-medium">{medicine.dosage}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Frequency:</span>
                            <p className="font-medium">{medicine.frequency}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <p className="font-medium">{medicine.duration}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Instructions:</span>
                            <p className="font-medium">{medicine.instructions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="final-prescription" className="space-y-6">
            <div className="flex justify-between items-center">
              <Alert className="flex-1 mr-4">
                <Edit3 className="h-4 w-4" />
                <AlertDescription>
                  Modify the AI suggestions below. Your changes will be saved to improve future recommendations.
                </AlertDescription>
              </Alert>
              <Button onClick={handleAddMedicine}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
            </div>

            <div className="grid gap-4">
              {prescriptionData.finalPrescription.map((medicine) => (
                <Card key={medicine.id}>
                  <CardContent className="p-4">
                    {editingMedicine === medicine.id ? (
                      <EditMedicineForm
                        medicine={medicine}
                        onSave={(updates) => handleMedicineEdit(medicine.id, updates)}
                        onCancel={() => setEditingMedicine(null)}
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Pill className="h-4 w-4 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                            {medicine.aiSuggested ? (
                              <Badge variant="secondary" className="text-xs">
                                AI Suggested
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Doctor Modified
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Dosage:</span>
                              <p className="font-medium">{medicine.dosage}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Frequency:</span>
                              <p className="font-medium">{medicine.frequency}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <p className="font-medium">{medicine.duration}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Instructions:</span>
                              <p className="font-medium">{medicine.instructions}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => setEditingMedicine(medicine.id)}>
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveMedicine(medicine.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Doctor Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Doctor's Notes</CardTitle>
                <CardDescription>Additional notes for this prescription</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add any additional notes or instructions..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning-insights" className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The AI system continuously learns from your prescription modifications to provide better recommendations
                in the future.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Suggestions Accepted</span>
                    <Badge variant="secondary">
                      {prescriptionData.finalPrescription.filter((m) => m.aiSuggested).length} /{" "}
                      {prescriptionData.aiSuggestions.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Doctor Modifications</span>
                    <Badge variant="outline">
                      {prescriptionData.finalPrescription.filter((m) => !m.aiSuggested).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Medicines Added</span>
                    <Badge variant="outline">
                      {prescriptionData.finalPrescription.length - prescriptionData.aiSuggestions.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personalization Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Your modifications will help the AI:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Learn your prescribing preferences</li>
                      <li>Improve future recommendations</li>
                      <li>Adapt to your clinical style</li>
                      <li>Consider patient-specific factors</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Edit Medicine Form Component
function EditMedicineForm({ medicine, onSave, onCancel }) {
  const [formData, setFormData] = useState(medicine)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
          <input
            type="text"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <input
            type="text"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
        <input
          type="text"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" size="sm">
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
