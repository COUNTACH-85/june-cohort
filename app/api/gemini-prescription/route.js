// app/api/gemini-prescription/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { symptoms, patientId, doctorId, timestamp } = await request.json();

    if (!symptoms) {
      return NextResponse.json(
        { success: false, error: "Symptoms are required" },
        { status: 400 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a detailed prompt for medical prescription generation
    const prompt = `
    As a medical AI assistant, analyze the following patient symptoms and generate a prescription recommendation. 
    Please provide a structured response in JSON format.

    Patient Symptoms: ${symptoms}
    Patient ID: ${patientId}
    Doctor ID: ${doctorId}
    Timestamp: ${timestamp}

    Please generate a prescription with the following structure:
    {
      "patientInfo": {
        "name": "Generate appropriate patient name",
        "age": "Estimate appropriate age based on symptoms",
        "gender": "Estimate gender if relevant to symptoms",
        "address": "Generate sample address",
        "phone": "Generate sample phone number"
      },
      "diagnosis": "Provide preliminary diagnosis based on symptoms",
      "medications": [
        {
          "id": "unique_id",
          "name": "Medicine name",
          "dosage": "Appropriate dosage",
          "frequency": "How often to take",
          "duration": "Treatment duration",
          "instructions": "Special instructions"
        }
      ],
      "notes": "Additional medical notes and recommendations",
      "context": "Brief explanation of the medical reasoning"
    }

    Important guidelines:
    - Only suggest common, safe medications
    - Include appropriate dosages and frequencies
    - Provide clear instructions
    - Add relevant medical advice
    - Consider drug interactions and contraindications
    - This is for educational/demo purposes - always consult a real doctor

    Generate the prescription now:
    `;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    let prescriptionData;
    try {
      // Extract JSON from the response (remove any markdown formatting)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prescriptionData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);

      // Fallback: Create a structured response from the text
      prescriptionData = {
        patientInfo: {
          name: "John Smith",
          age: "35",
          gender: "Male",
          address: "123 Main St, City, State",
          phone: "+1 (555) 123-4567",
        },
        diagnosis: `Based on symptoms: ${symptoms}`,
        medications: [
          {
            id: Date.now().toString(),
            name: "Paracetamol",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "5 days",
            instructions: "Take with food",
          },
        ],
        notes: text.slice(0, 500) + "...",
        context: "AI analysis of presented symptoms",
      };
    }

    // Add unique IDs to medications if missing
    prescriptionData.medications = prescriptionData.medications.map(
      (med, index) => ({
        ...med,
        id: med.id || `med_${Date.now()}_${index}`,
        aiSuggested: true,
      })
    );

    return NextResponse.json({
      success: true,
      prescription: prescriptionData,
      aiResponse: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate prescription",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
