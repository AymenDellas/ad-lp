import { ScrapedContent, AnalysisResult } from "../types";

const GROQ_API_KEY = "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function analyzeWithGroq(
  adContent: ScrapedContent,
  landingPageContent: ScrapedContent
): Promise<AnalysisResult> {
  const prompt = `
You are an expert conversion optimization analyst. Analyze the alignment between this Meta ad and landing page for potential misalignments.

AD CONTENT:
- URL: ${adContent.url}
- Title: ${adContent.title}
- Headline: ${adContent.headline}
- Subheadline: ${adContent.subheadline}
- CTAs: ${adContent.cta.join(", ")}
- Offers: ${adContent.offers.join(", ")}
- Target Audience: ${adContent.targetAudience}
- Urgency Cues: ${adContent.urgencyCues.join(", ")}
- Body Text: ${adContent.bodyText}

LANDING PAGE CONTENT:
- URL: ${landingPageContent.url}
- Title: ${landingPageContent.title}
- Headline: ${landingPageContent.headline}
- Subheadline: ${landingPageContent.subheadline}
- CTAs: ${landingPageContent.cta.join(", ")}
- Offers: ${landingPageContent.offers.join(", ")}
- Target Audience: ${landingPageContent.targetAudience}
- Urgency Cues: ${landingPageContent.urgencyCues.join(", ")}
- Body Text: ${landingPageContent.bodyText}

CRITICAL ANALYSIS FRAMEWORK:

1. HEADLINE DISCONNECT
- Does the ad headline promise a specific outcome but LP headline is generic?
- Are numbers/percentages from ad missing on LP?
- Is there a pain point → solution mismatch?

2. CTA BETRAYAL
- Is ad CTA high commitment but LP CTA low commitment?
- Are there verb downgrades (Get → See)?
- Does LP force extra steps before main offer?

3. OFFER FRAGMENTATION
- Are time-bound/scarce incentives from ad missing on LP?
- Are "Free" promises contradicted by credit card requirements?
- Are urgency cues missing?

4. VISUAL WHIPLASH (secondary)
- Style mismatch between ad and LP?

5. AUDIENCE AMNESIA (secondary)
- Does ad target specific role but LP speaks generally?

Return ONLY a valid JSON response with this exact structure:
{
  "criticalChecks": {
    "headlineDisconnect": {
      "detected": boolean,
      "details": "specific explanation",
      "severity": "high|medium|low"
    },
    "ctaBetrayal": {
      "detected": boolean,
      "details": "specific explanation", 
      "severity": "high|medium|low"
    },
    "offerFragmentation": {
      "detected": boolean,
      "details": "specific explanation",
      "severity": "high|medium|low"
    }
  },
  "secondaryChecks": {
    "visualWhiplash": {
      "detected": boolean,
      "details": "specific explanation"
    },
    "audienceAmnesia": {
      "detected": boolean,
      "details": "specific explanation"
    }
  },
  "qualifiedLead": boolean,
  "overallScore": number between 0-100,
  "summary": "brief overall assessment"
}
`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from Groq API");
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Groq API error:", error);
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    } else {
      throw new Error("Analysis failed: Unknown error");
    }
  }
}
