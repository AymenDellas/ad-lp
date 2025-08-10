import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Eye, Users } from 'lucide-react';
import { AnalysisResult } from '../types';

interface ResultsDisplayProps {
  result: AnalysisResult;
  adUrl: string;
  landingPageUrl: string;
}

export function ResultsDisplay({ result, adUrl, landingPageUrl }: ResultsDisplayProps) {
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const criticalIssues = Object.values(result.criticalChecks).filter(check => check.detected);
  const secondaryIssues = Object.values(result.secondaryChecks).filter(check => check.detected);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h2>
            <p className="text-gray-600">Comprehensive alignment analysis completed</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}
            </div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2">Ad URL</h4>
            <p className="text-sm text-gray-600 break-all">{adUrl}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2">Landing Page URL</h4>
            <p className="text-sm text-gray-600 break-all">{landingPageUrl}</p>
          </div>
        </div>

        {result.qualifiedLead && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl mb-6">
            <div className="flex items-center text-red-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <strong>Qualified Lead Alert!</strong>
            </div>
            <p className="text-red-700 mt-1">
              Critical misalignments detected. This campaign likely needs immediate optimization.
            </p>
          </div>
        )}

        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2">Executive Summary</h4>
          <p className="text-gray-700">{result.summary}</p>
        </div>
      </div>

      {/* Critical Checks */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
          Critical Checks
        </h3>
        
        <div className="space-y-6">
          <div className={`p-6 border-2 rounded-xl ${
            result.criticalChecks.headlineDisconnect.detected 
              ? getSeverityColor(result.criticalChecks.headlineDisconnect.severity)
              : 'text-green-600 bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">1. Headline Disconnect</h4>
              {result.criticalChecks.headlineDisconnect.detected ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <p className="leading-relaxed">{result.criticalChecks.headlineDisconnect.details}</p>
            {result.criticalChecks.headlineDisconnect.detected && (
              <div className="mt-3 text-sm font-medium">
                Severity: {result.criticalChecks.headlineDisconnect.severity.toUpperCase()}
              </div>
            )}
          </div>

          <div className={`p-6 border-2 rounded-xl ${
            result.criticalChecks.ctaBetrayal.detected 
              ? getSeverityColor(result.criticalChecks.ctaBetrayal.severity)
              : 'text-green-600 bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">2. CTA Betrayal</h4>
              {result.criticalChecks.ctaBetrayal.detected ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <p className="leading-relaxed">{result.criticalChecks.ctaBetrayal.details}</p>
            {result.criticalChecks.ctaBetrayal.detected && (
              <div className="mt-3 text-sm font-medium">
                Severity: {result.criticalChecks.ctaBetrayal.severity.toUpperCase()}
              </div>
            )}
          </div>

          <div className={`p-6 border-2 rounded-xl ${
            result.criticalChecks.offerFragmentation.detected 
              ? getSeverityColor(result.criticalChecks.offerFragmentation.severity)
              : 'text-green-600 bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">3. Offer Fragmentation</h4>
              {result.criticalChecks.offerFragmentation.detected ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <p className="leading-relaxed">{result.criticalChecks.offerFragmentation.details}</p>
            {result.criticalChecks.offerFragmentation.detected && (
              <div className="mt-3 text-sm font-medium">
                Severity: {result.criticalChecks.offerFragmentation.severity.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Checks */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
          Secondary Checks
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 border-2 rounded-xl ${
            result.secondaryChecks.visualWhiplash.detected 
              ? 'text-orange-600 bg-orange-50 border-orange-200'
              : 'text-green-600 bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Visual Whiplash</h4>
              <Eye className="w-5 h-5" />
            </div>
            <p className="text-sm leading-relaxed">{result.secondaryChecks.visualWhiplash.details}</p>
          </div>

          <div className={`p-6 border-2 rounded-xl ${
            result.secondaryChecks.audienceAmnesia.detected 
              ? 'text-orange-600 bg-orange-50 border-orange-200'
              : 'text-green-600 bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Audience Amnesia</h4>
              <Users className="w-5 h-5" />
            </div>
            <p className="text-sm leading-relaxed">{result.secondaryChecks.audienceAmnesia.details}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold mb-6">Analysis Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{criticalIssues.length}</div>
            <div className="text-gray-300 text-sm">Critical Issues</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{secondaryIssues.length}</div>
            <div className="text-gray-300 text-sm">Secondary Issues</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}%
            </div>
            <div className="text-gray-300 text-sm">Overall Score</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${result.qualifiedLead ? 'text-red-400' : 'text-green-400'}`}>
              {result.qualifiedLead ? 'YES' : 'NO'}
            </div>
            <div className="text-gray-300 text-sm">Qualified Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
}