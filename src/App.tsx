import React, { useState } from 'react';
import { URLInput } from './components/URLInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeWithBackend, checkBackendHealth } from './utils/api';
import { AnalysisResult } from './types';
import { Zap, AlertCircle } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState<{ ad: string; lp: string } | null>(null);

  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend status on component mount
  React.useEffect(() => {
    checkBackendHealth()
      .then(isOnline => setBackendStatus(isOnline ? 'online' : 'offline'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleAnalyze = async (adUrl: string, landingPageUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Starting backend analysis...');
      const response = await analyzeWithBackend(adUrl, landingPageUrl);
      
      setResult(response.analysis);
      setUrls({ ad: adUrl, lp: landingPageUrl });
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setUrls(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Ad Alignment Analyzer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powered by Groq AI • Identify conversion-killing misalignments between your Meta ads and landing pages
          </p>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl max-w-4xl mx-auto">
            <div className="flex items-center text-red-800 mb-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              <strong>Analysis Failed</strong>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Backend Status Indicator */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className={`p-4 rounded-xl border-2 ${
            backendStatus === 'online' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : backendStatus === 'offline'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                backendStatus === 'online' ? 'bg-green-500' :
                backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-medium">
                Backend Service: {
                  backendStatus === 'online' ? 'Online & Ready' :
                  backendStatus === 'offline' ? 'Offline - Deploy backend service first' :
                  'Checking connection...'
                }
              </span>
            </div>
            {backendStatus === 'offline' && (
              <p className="text-sm mt-2 text-center">
                Deploy the backend service to Railway, Render, or Vercel to enable analysis
              </p>
            )}
          </div>
        </div>

        {!result && !error && (
          <URLInput 
            onAnalyze={handleAnalyze} 
            isLoading={isLoading} 
            backendOnline={backendStatus === 'online'}
          />
        )}

        {result && urls && (
          <div>
            <div className="mb-8 text-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Analyze New Pages
              </button>
            </div>
            <ResultsDisplay 
              result={result} 
              adUrl={urls.ad} 
              landingPageUrl={urls.lp} 
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-2xl shadow-lg border border-gray-100">
            <Zap className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-gray-700 font-medium">Powered by Groq AI</span>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Advanced AI analysis for conversion optimization professionals
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;