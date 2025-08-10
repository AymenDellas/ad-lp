import React, { useState } from 'react';
import { Link, AlertCircle, Zap } from 'lucide-react';

interface URLInputProps {
  onAnalyze: (adUrl: string, landingPageUrl: string) => void;
  isLoading: boolean;
  backendOnline: boolean;
}

export function URLInput({ onAnalyze, isLoading, backendOnline }: URLInputProps) {
  const [adUrl, setAdUrl] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [errors, setErrors] = useState<{ ad?: string; lp?: string }>({});

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { ad?: string; lp?: string } = {};
    
    if (!adUrl) {
      newErrors.ad = 'Meta ad URL is required';
    } else if (!validateUrl(adUrl)) {
      newErrors.ad = 'Please enter a valid URL';
    }
    
    if (!landingPageUrl) {
      newErrors.lp = 'Landing page URL is required';
    } else if (!validateUrl(landingPageUrl)) {
      newErrors.lp = 'Please enter a valid URL';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onAnalyze(adUrl, landingPageUrl);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          AI Alignment Checker
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Analyze your Meta ads and landing pages for conversion-killing misalignments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="adUrl" className="block text-sm font-semibold text-gray-700 mb-3">
            <Link className="w-4 h-4 inline mr-2" />
            Meta Ad URL
          </label>
          <input
            type="url"
            id="adUrl"
            value={adUrl}
            onChange={(e) => setAdUrl(e.target.value)}
            placeholder="https://www.facebook.com/ads/..."
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
              errors.ad ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.ad && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.ad}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="landingPageUrl" className="block text-sm font-semibold text-gray-700 mb-3">
            <Link className="w-4 h-4 inline mr-2" />
            Landing Page URL
          </label>
          <input
            type="url"
            id="landingPageUrl"
            value={landingPageUrl}
            onChange={(e) => setLandingPageUrl(e.target.value)}
            placeholder="https://your-landing-page.com"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
              errors.lp ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          {errors.lp && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.lp}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !backendOnline}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Analyzing with Puppeteer...
            </div>
          ) : !backendOnline ? (
            'Backend Service Required'
          ) : (
            'Analyze with AI + Puppeteer'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>Powered by Puppeteer:</strong> This tool uses real browser automation for extremely accurate content extraction and Groq AI for advanced misalignment analysis.
        </p>
      </div>
    </div>
  );
}