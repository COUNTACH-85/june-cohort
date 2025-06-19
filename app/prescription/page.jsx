"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Badge from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Brain, 
  Check, 
  Edit3, 
  Plus, 
  Save, 
  Trash2, 
  User, 
  Clock, 
  Pill, 
  AlertTriangle,
  FileText,
  Printer,
  Download,
  Stethoscope,
  Calendar,
  MapPin,
  Phone
} from "lucide-react"

export default function PrescriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [prescriptionData, setPrescriptionData] = useState(null)
  const [editingMedicine, setEditingMedicine] = useState(null)
  const [doctorNotes, setDoctorNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [prescriptionId, setPrescriptionId] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/signin")
      return
    }

    const generateAIPrescription = async () => {
      setIsLoading(true)
      
      try {
        const symptoms = searchParams.get("symptoms") || ""
        const patientId = searchParams.get("patientId") || "PAT001"
        
        // Generate unique prescription ID
        const prescId = `RX${Date.now().toString().slice(-6)}`
        setPrescriptionId(prescId)
        
        const res = await fetch("/api/gemini-prescription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            symptoms: decodeURIComponent(symptoms),
            patientId: patientId,
            doctorId: user.id,
            timestamp: new Date().toISOString()
          })
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`)
        }

        const data = await res.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to generate prescription")
        }

        setPrescriptionData({
          prescriptionId: prescId,
          patientName: data.prescription.patientInfo.name || "John Smith",
          patientAge: data.prescription.patientInfo.age || "35",
          patientGender: data.prescription.patientInfo.gender || "Male",
          patientAddress: data.prescription.patientInfo.address || "123 Main St, City",
          patientPhone: data.prescription.patientInfo.phone || "+1 (555) 123-4567",
          symptoms: decodeURIComponent(symptoms),
          diagnosis: data.prescription.diagnosis || "Based on presented symptoms",
          aiSuggestions: data.prescription.medications || [],
          finalPrescription: [...(data.prescription.medications || [])],
          doctorNotes: data.prescription.notes || "",
          doctorInfo: {
            name: user.name || "Dr. Sarah Johnson",
            qualification: "MBBS, MD",
            registration: "MCI-12345",
            clinic: "City Medical Center",
            address: "456 Health Ave, Medical District",
            phone: "+1 (555) 987-6543"
          },
          createdAt: new Date(),
          mcpContext: data.prescription.context,
        })
      } catch (error) {
        console.error("Error generating prescription:", error)
        alert("Error generating prescription: " + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    generateAIPrescription()
  }, [user, router, searchParams])

  const handleMedicineEdit = (medicineId, updates) => {
    if (!prescriptionData) return

    const updatedPrescription = prescriptionData.finalPrescription.map((med) =>
      med.id === medicineId
        ? { ...med, ...updates, aiSuggested: false }
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

    try {
      const res = await fetch("/api/mcp/save-prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prescriptionId: prescriptionData.prescriptionId,
          prescription: prescriptionData,
          doctorModifications: prescriptionData.finalPrescription.filter(med => !med.aiSuggested)
        })
      })

      if (!res.ok) throw new Error("Failed to save prescription")

      alert("Prescription saved successfully! The AI system has learned from your modifications.")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving prescription:", error)
      alert("Error saving prescription: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating AI Prescription</h2>
          <p className="text-gray-600">Analyzing symptoms with Gemini AI...</p>
        </div>
      </div>
    )
  }

  if (!prescriptionData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b print:hidden">
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
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleSavePrescription} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Prescription"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="prescription" className="space-y-6">
          <TabsList className="print:hidden">
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
            <TabsTrigger value="ai-suggestions">AI Analysis</TabsTrigger>
            <TabsTrigger value="edit">Edit Prescription</TabsTrigger>
            <TabsTrigger value="learning-insights">AI Learning</TabsTrigger>
          </TabsList>

          {/* Main Prescription View */}
          <TabsContent value="prescription" className="space-y-6">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-8 print:border-black print:shadow-none print:rounded-none">
              {/* Prescription Header */}
              <div className="border-b-2 border-gray-200 pb-6 mb-6 print:border-black">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">PRESCRIPTION</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Rx ID: {prescriptionData.prescriptionId}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {prescriptionData.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">
                      <Brain className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                    <p className="text-xs text-gray-500">Powered by Gemini AI</p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-gray-200 rounded-lg p-4 print:border-black">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                    Doctor Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong> {prescriptionData.doctorInfo.name}</strong></p>
                    <p>{prescriptionData.doctorInfo.qualification}</p>
                    <p>Reg. No: {prescriptionData.doctorInfo.registration}</p>
                    <p className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {prescriptionData.doctorInfo.clinic}
                    </p>
                    <p>{prescriptionData.doctorInfo.address}</p>
                    <p className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {prescriptionData.doctorInfo.phone}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 print:border-black">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-green-600" />
                    Patient Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>{prescriptionData.patientName}</strong></p>
                    <p>Age: {prescriptionData.patientAge} years, {prescriptionData.patientGender}</p>
                    <p className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {prescriptionData.patientAddress}
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {prescriptionData.patientPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chief Complaints & Diagnosis */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Chief Complaints:</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border print:bg-white print:border-black">
                      {prescriptionData.symptoms}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Diagnosis:</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border print:bg-white print:border-black">
                      {prescriptionData.diagnosis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Prescription Medications */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 print:border-black">
                  ℞ MEDICATIONS
                </h3>
                <div className="space-y-4">
                  {prescriptionData.finalPrescription.map((medicine, index) => (
                    <div key={medicine.id} className="border border-gray-200 rounded-lg p-4 print:border-black print:rounded-none">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full print:bg-gray-200 print:text-black">
                              {index + 1}
                            </span>
                            <h4 className="font-semibold text-lg text-gray-900">{medicine.name}</h4>
                            {!medicine.aiSuggested && (
                              <Badge variant="outline" className="text-xs print:hidden">
                                Modified
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ml-8">
                            <div>
                              <span className="text-gray-600 font-medium">Dosage:</span>
                              <p className="font-semibold">{medicine.dosage}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Frequency:</span>
                              <p className="font-semibold">{medicine.frequency}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Duration:</span>
                              <p className="font-semibold">{medicine.duration}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Instructions:</span>
                              <p className="font-semibold">{medicine.instructions}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor's Notes */}
              {(prescriptionData.doctorNotes || doctorNotes) && (
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Notes:</h4>
                  <p className="text-sm bg-gray-50 p-4 rounded border print:bg-white print:border-black">
                    {prescriptionData.doctorNotes || doctorNotes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t border-gray-200 pt-6 print:border-black">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    <p>Date: {prescriptionData.createdAt.toLocaleDateString()}</p>
                    <p>Time: {prescriptionData.createdAt.toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="h-16 border-b border-gray-400 mb-2 print:border-black"></div>
                    <p className="font-medium"> {prescriptionData.doctorInfo.name}</p>
                    <p>Digital Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="ai-suggestions" className="space-y-6">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                Gemini AI has analyzed the symptoms and generated the following medicine recommendations based on medical knowledge and best practices.
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
                            Gemini AI Suggested
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

          {/* Edit Prescription Tab */}
          <TabsContent value="edit" className="space-y-6">
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

          {/* Learning Insights Tab */}
          <TabsContent value="learning-insights" className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                The Gemini AI system continuously learns from your prescription modifications through the MCP server to provide better recommendations in the future.
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
                  <CardTitle>AI Enhancement Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Your modifications help Gemini AI:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Learn your prescribing preferences</li>
                      <li>Improve diagnostic accuracy</li>
                      <li>Adapt to your clinical style</li>
                      <li>Consider patient-specific factors</li>
                      <li>Update medical knowledge base</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .prescription-print, .prescription-print * {
            visibility: visible;
          }
          .prescription-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
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
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
          <input
            type="text"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <input
            type="text"
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
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
          required
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