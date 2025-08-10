const GROQ_API_KEY = "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function analyzeWithGroq(adContent, landingPageContent) {
  const prompt = `
You are an expert conversion optimization analyst. Analyze the alignment between this Meta ad and landing page for potential misalignments that could be costing conversions.

AD CONTENT:
- URL: ${adContent.url}
- Title: ${adContent.title}
- Headline: ${adContent.headline}
- Subheadline: ${adContent.subheadline}
- CTAs: ${adContent.cta.join(", ")}
- Offers: ${adContent.offers.join(", ")}
- Target Audience: ${adContent.targetAudience}
- Urgency Cues: ${adContent.urgencyCues.join(", ")}
- Body Text: ${adContent.bodyText.substring(0, 500)}...
- Has Video: ${adContent.hasVideo}
- Has Form: ${adContent.hasForm}
- Pricing: ${adContent.pricing.join(", ")}

LANDING PAGE CONTENT:
- URL: ${landingPageContent.url}
- Title: ${landingPageContent.title}
- Headline: ${landingPageContent.headline}
- Subheadline: ${landingPageContent.subheadline}
- CTAs: ${landingPageContent.cta.join(", ")}
- Offers: ${landingPageContent.offers.join(", ")}
- Target Audience: ${landingPageContent.targetAudience}
- Urgency Cues: ${landingPageContent.urgencyCues.join(", ")}
- Body Text: ${landingPageContent.bodyText.substring(0, 500)}...
- Has Video: ${landingPageContent.hasVideo}
- Has Form: ${landingPageContent.hasForm}
- Pricing: ${landingPageContent.pricing.join(", ")}
- Social Proof: ${landingPageContent.socialProof.join(", ")}

CRITICAL ANALYSIS FRAMEWORK:

1. HEADLINE DISCONNECT (HIGH PRIORITY)
- Does the ad headline promise a specific outcome but LP headline is generic?
- Are numbers/percentages from ad missing on LP?
- Is there a pain point → solution mismatch?
- Is the ad's core promise buried below 50% scroll depth on LP?

2. CTA BETRAYAL (HIGH PRIORITY)
- Is ad CTA high commitment ("Get Demo", "Free Audit") but LP CTA low commitment ("Learn More", "Watch Video")?
- Are there verb downgrades ("Get" → "See")?
- Does LP force extra steps before main offer (multi-step conversion)?
- Button psychology clash (urgent vs passive)?

3. OFFER FRAGMENTATION (HIGH PRIORITY)
- Are time-bound/scarce incentives from ad missing on LP?
- Are "Free" promises contradicted by credit card requirements?
- Are urgency cues missing from LP when present in ad?
- Key offer elements separated or hidden?

4. VISUAL WHIPLASH (SECONDARY)
- Style mismatch between ad and LP?
- Ad shows specific UI/dashboard but LP uses generic imagery?

5. AUDIENCE AMNESIA (SECONDARY)
- Does ad target specific role but LP speaks generally?
- Form fields don't match targeting?

SCORING CRITERIA:
- Each critical issue detected reduces score by 15-25 points
- Secondary issues reduce score by 5-10 points
- Perfect alignment = 90-100 points
- Good alignment = 70-89 points
- Poor alignment = 50-69 points
- Critical misalignment = Below 50 points

QUALIFIED LEAD CRITERIA:
If ANY critical check is detected with HIGH severity, mark as qualified lead.

Return ONLY a valid JSON response with this exact structure:
{
  "criticalChecks": {
    "headlineDisconnect": {
      "detected": boolean,
      "details": "specific explanation with examples from the content",
      "severity": "high|medium|low"
    },
    "ctaBetrayal": {
      "detected": boolean,
      "details": "specific explanation with examples from the content", 
      "severity": "high|medium|low"
    },
    "offerFragmentation": {
      "detected": boolean,
      "details": "specific explanation with examples from the content",
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
  "summary": "brief overall assessment with specific recommendations"
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
      throw new Error(
        `Groq API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from Groq API");
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Raw Groq response:", content);
      throw new Error("Could not extract JSON from Groq response");
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!analysisResult.criticalChecks || !analysisResult.secondaryChecks) {
      throw new Error("Invalid analysis result structure");
    }

    return analysisResult;
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}
