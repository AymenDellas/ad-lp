export interface AnalysisResult {
  criticalChecks: {
    headlineDisconnect: {
      detected: boolean;
      details: string;
      severity: 'high' | 'medium' | 'low';
    };
    ctaBetrayal: {
      detected: boolean;
      details: string;
      severity: 'high' | 'medium' | 'low';
    };
    offerFragmentation: {
      detected: boolean;
      details: string;
      severity: 'high' | 'medium' | 'low';
    };
  };
  secondaryChecks: {
    visualWhiplash: {
      detected: boolean;
      details: string;
    };
    audienceAmnesia: {
      detected: boolean;
      details: string;
    };
  };
  qualifiedLead: boolean;
  overallScore: number;
  summary: string;
}

export interface ScrapedContent {
  url: string;
  title: string;
  headline: string;
  subheadline: string;
  cta: string[];
  offers: string[];
  images: string[];
  bodyText: string;
  targetAudience: string;
  urgencyCues: string[];
}