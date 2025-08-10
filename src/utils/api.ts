// Backend API configuration
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "ad-lp.railway.internal" // Replace with your deployed backend URL
    : "http://localhost:3001";

export interface BackendAnalysisResponse {
  adContent: any;
  landingPageContent: any;
  analysis: any;
}

export async function analyzeWithBackend(
  adUrl: string,
  landingPageUrl: string
): Promise<BackendAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adUrl,
        landingPageUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || `Backend error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Backend API error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze pages: ${error.message}`);
    } else {
      throw new Error("Failed to analyze pages: Unknown error occurred");
    }
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
