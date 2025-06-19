// app/api/mcp/save-prescription/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// MCP Server configuration
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3003";
const MCP_API_KEY = process.env.MCP_API_KEY;

// Local storage path for prescriptions (fallback)
const PRESCRIPTIONS_DIR = path.join(process.cwd(), "data", "prescriptions");

export async function POST(request) {
  try {
    const { prescriptionId, prescription, doctorModifications } =
      await request.json();

    if (!prescriptionId || !prescription) {
      return NextResponse.json(
        { success: false, error: "Prescription ID and data are required" },
        { status: 400 }
      );
    }

    // Prepare prescription data for MCP server
    const mcpData = {
      id: prescriptionId,
      timestamp: new Date().toISOString(),
      originalAISuggestions: prescription.aiSuggestions,
      finalPrescription: prescription.finalPrescription,
      doctorModifications: doctorModifications || [],
      patientInfo: prescription.patientInfo || {},
      doctorInfo: prescription.doctorInfo || {},
      symptoms: prescription.symptoms,
      diagnosis: prescription.diagnosis,
      notes: prescription.doctorNotes,
      learningData: {
        modificationsCount: doctorModifications?.length || 0,
        acceptedSuggestions: prescription.finalPrescription.filter(
          (med) => med.aiSuggested
        ).length,
        totalSuggestions: prescription.aiSuggestions?.length || 0,
        customMedicines: prescription.finalPrescription.filter(
          (med) => !med.aiSuggested
        ).length,
      },
    };

    let mcpSuccess = false;
    let mcpError = null;

    // Try to send to MCP server first
    try {
      const mcpResponse = await fetch(
        `${MCP_SERVER_URL}/api/prescriptions/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MCP_API_KEY}`,
            "X-Client-Type": "healthcare-app",
          },
          body: JSON.stringify(mcpData),
          timeout: 10000, // 10 second timeout
        }
      );

      if (mcpResponse.ok) {
        const mcpResult = await mcpResponse.json();
        mcpSuccess = true;
        console.log("MCP server save successful:", mcpResult);
      } else {
        mcpError = `MCP server responded with status: ${mcpResponse.status}`;
      }
    } catch (error) {
      mcpError = `MCP server connection failed: ${error.message}`;
      console.warn(
        "MCP server unavailable, falling back to local storage:",
        error.message
      );
    }

    // Save to local storage as backup or primary storage
    try {
      // Ensure directory exists
      await fs.mkdir(PRESCRIPTIONS_DIR, { recursive: true });

      // Save prescription file
      const filePath = path.join(PRESCRIPTIONS_DIR, `${prescriptionId}.json`);
      await fs.writeFile(filePath, JSON.stringify(mcpData, null, 2));

      // Update index file
      await updatePrescriptionIndex(prescriptionId, mcpData);

      console.log("Prescription saved locally:", filePath);
    } catch (localError) {
      console.error("Failed to save prescription locally:", localError);

      if (!mcpSuccess) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Failed to save prescription to both MCP server and local storage",
            mcpError,
            localError: localError.message,
          },
          { status: 500 }
        );
      }
    }

    // Send learning data to AI improvement endpoint
    try {
      await sendLearningData(mcpData);
    } catch (learningError) {
      console.warn("Failed to send learning data:", learningError.message);
      // Don't fail the request if learning data fails
    }

    return NextResponse.json({
      success: true,
      prescriptionId,
      mcpServerUsed: mcpSuccess,
      localBackupSaved: true,
      mcpError: mcpSuccess ? null : mcpError,
      learningDataSent: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Save prescription error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save prescription",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Update prescription index for quick lookups
async function updatePrescriptionIndex(prescriptionId, prescriptionData) {
  try {
    const indexPath = path.join(PRESCRIPTIONS_DIR, "index.json");

    let index = [];
    try {
      const indexContent = await fs.readFile(indexPath, "utf8");
      index = JSON.parse(indexContent);
    } catch (error) {
      // Index file doesn't exist yet, start with empty array
      console.log("Creating new prescription index");
    }

    // Add or update prescription in index
    const existingIndex = index.findIndex((item) => item.id === prescriptionId);
    const indexEntry = {
      id: prescriptionId,
      patientName: prescriptionData.patientInfo?.name || "Unknown",
      doctorName: prescriptionData.doctorInfo?.name || "Unknown",
      symptoms: prescriptionData.symptoms?.slice(0, 100) || "",
      diagnosis: prescriptionData.diagnosis?.slice(0, 100) || "",
      medicationCount: prescriptionData.finalPrescription?.length || 0,
      timestamp: prescriptionData.timestamp,
      modifications: prescriptionData.learningData?.modificationsCount || 0,
    };

    if (existingIndex >= 0) {
      index[existingIndex] = indexEntry;
    } else {
      index.push(indexEntry);
    }

    // Keep only the last 1000 prescriptions
    if (index.length > 1000) {
      index = index.slice(-1000);
    }

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  } catch (error) {
    console.error("Failed to update prescription index:", error);
  }
}

// Send learning data for AI improvement
async function sendLearningData(prescriptionData) {
  try {
    const learningPayload = {
      prescriptionId: prescriptionData.id,
      symptoms: prescriptionData.symptoms,
      aiSuggestions: prescriptionData.originalAISuggestions,
      doctorModifications: prescriptionData.doctorModifications,
      finalPrescription: prescriptionData.finalPrescription,
      learningMetrics: prescriptionData.learningData,
      timestamp: prescriptionData.timestamp,
    };

    // Send to MCP learning endpoint
    if (MCP_SERVER_URL) {
      await fetch(`${MCP_SERVER_URL}/api/learning/prescription-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MCP_API_KEY}`,
        },
        body: JSON.stringify(learningPayload),
        timeout: 5000,
      });
    }

    // Also save learning data locally
    const learningDir = path.join(process.cwd(), "data", "learning");
    await fs.mkdir(learningDir, { recursive: true });

    const learningFile = path.join(
      learningDir,
      `learning_${prescriptionData.id}.json`
    );
    await fs.writeFile(learningFile, JSON.stringify(learningPayload, null, 2));
  } catch (error) {
    console.error("Learning data submission failed:", error);
    throw error;
  }
}

// GET endpoint to retrieve prescriptions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit")) || 50;

    if (prescriptionId) {
      // Get specific prescription
      const filePath = path.join(PRESCRIPTIONS_DIR, `${prescriptionId}.json`);
      try {
        const content = await fs.readFile(filePath, "utf8");
        const prescription = JSON.parse(content);

        return NextResponse.json({
          success: true,
          prescription,
        });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: "Prescription not found" },
          { status: 404 }
        );
      }
    } else {
      // Get prescription list
      try {
        const indexPath = path.join(PRESCRIPTIONS_DIR, "index.json");
        const indexContent = await fs.readFile(indexPath, "utf8");
        const index = JSON.parse(indexContent);

        // Return most recent prescriptions
        const recent = index
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);

        return NextResponse.json({
          success: true,
          prescriptions: recent,
          total: index.length,
        });
      } catch (error) {
        return NextResponse.json({
          success: true,
          prescriptions: [],
          total: 0,
        });
      }
    }
  } catch (error) {
    console.error("Get prescriptions error:", error);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
