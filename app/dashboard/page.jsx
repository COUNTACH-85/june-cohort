"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Badge from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, ArrowLeft, Calendar, Clock, FileText, Phone, Search, User, MapPin, Heart } from "lucide-react"

const mockPatients = [
  {
    id: "1",
    name: "John Smith",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    address: "123 Main St, New York, NY 10001",
    diagnosis: "Hypertension",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-15",
    status: "scheduled",
    medicalHistory: ["Hypertension (2020)", "Type 2 Diabetes (2019)", "High Cholesterol (2018)"],
    vitals: {
      bloodPressure: "140/90",
      heartRate: "78 bpm",
      temperature: "98.6°F",
      weight: "185 lbs",
    },
  },
  {
    id: "2",
    name: "Sarah Johnson",
    age: 32,
    gender: "Female",
    phone: "+1 (555) 987-6543",
    email: "sarah.johnson@email.com",
    address: "456 Oak Ave, Los Angeles, CA 90210",
    diagnosis: "Migraine",
    lastVisit: "2024-01-20",
    nextAppointment: "2024-02-20",
    status: "scheduled",
    medicalHistory: ["Chronic Migraines (2021)", "Anxiety (2020)"],
    vitals: {
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      temperature: "98.4°F",
      weight: "135 lbs",
    },
  },
  {
    id: "3",
    name: "Michael Brown",
    age: 58,
    gender: "Male",
    phone: "+1 (555) 456-7890",
    email: "michael.brown@email.com",
    address: "789 Pine St, Chicago, IL 60601",
    diagnosis: "Arthritis",
    lastVisit: "2024-01-10",
    nextAppointment: "2024-02-10",
    status: "completed",
    medicalHistory: ["Osteoarthritis (2019)", "Lower Back Pain (2018)"],
    vitals: {
      bloodPressure: "130/85",
      heartRate: "75 bpm",
      temperature: "98.7°F",
      weight: "200 lbs",
    },
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentSymptoms, setCurrentSymptoms] = useState("")

  if (!user) {
    router.push("/signin")
    return null
  }

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
  }

  const handleGeneratePrescription = () => {
    if (selectedPatient && currentSymptoms) {
      router.push(`/prescription?patientId=${selectedPatient.id}&symptoms=${encodeURIComponent(currentSymptoms)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Doctor Dashboard</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">Welcome, {user.name}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedPatient ? (
          // Patient List View
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Management</h2>
              <p className="text-gray-600">Select a patient to view their profile and manage appointments</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients by name or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Patient Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <Card
                  key={patient.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePatientSelect(patient)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{patient.name}</CardTitle>
                        <CardDescription>
                          {patient.age} years old • {patient.gender}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          patient.status === "scheduled"
                            ? "default"
                            : patient.status === "completed"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {patient.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{patient.diagnosis}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Next: {patient.nextAppointment}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Patient Profile View
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Patient List
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                <p className="text-gray-600">
                  {selectedPatient.age} years old • {selectedPatient.gender}
                </p>
              </div>
              <Badge
                variant={
                  selectedPatient.status === "scheduled"
                    ? "default"
                    : selectedPatient.status === "completed"
                      ? "secondary"
                      : "destructive"
                }
              >
                {selectedPatient.status}
              </Badge>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Patient Profile</TabsTrigger>
                <TabsTrigger value="history">Medical History</TabsTrigger>
                <TabsTrigger value="examination">Current Examination</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{selectedPatient.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{selectedPatient.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-gray-900 flex items-start">
                          <MapPin className="h-4 w-4 mr-1 mt-0.5 text-gray-400" />
                          {selectedPatient.address}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Vitals */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Heart className="h-5 w-5 mr-2" />
                        Current Vitals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Blood Pressure</label>
                          <p className="text-gray-900 font-medium">{selectedPatient.vitals.bloodPressure}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Heart Rate</label>
                          <p className="text-gray-900 font-medium">{selectedPatient.vitals.heartRate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Temperature</label>
                          <p className="text-gray-900 font-medium">{selectedPatient.vitals.temperature}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Weight</label>
                          <p className="text-gray-900 font-medium">{selectedPatient.vitals.weight}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Appointment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Appointment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Diagnosis</label>
                        <p className="text-gray-900 font-medium">{selectedPatient.diagnosis}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Visit</label>
                        <p className="text-gray-900">{selectedPatient.lastVisit}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Next Appointment</label>
                        <p className="text-gray-900">{selectedPatient.nextAppointment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPatient.medicalHistory.map((item, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-400 mr-3" />
                          <span className="text-gray-900">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="examination" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Symptoms</CardTitle>
                    <CardDescription>
                      Enter the patient's current symptoms to generate AI-powered prescription recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Describe current symptoms</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Patient reports headache, fever, and fatigue for the past 3 days..."
                        value={currentSymptoms}
                        onChange={(e) => setCurrentSymptoms(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleGeneratePrescription} disabled={!currentSymptoms.trim()} className="w-full">
                      Generate AI Prescription
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
