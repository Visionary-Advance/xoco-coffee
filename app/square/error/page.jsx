// app/square/error/page.js
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'access_denied':
        return 'You declined to authorize the application.';
      case 'no_code':
        return 'No authorization code was received from Square.';
      case 'invalid_state':
        return 'Invalid security state parameter.';
      case 'token_exchange_failed':
        return 'Failed to exchange authorization code for access token.';
      case 'server_error':
        return 'A server error occurred during the connection process.';
      default:
        return 'An unknown error occurred during the Square connection process.';
    }
  };

  const getErrorSolution = (errorCode) => {
    switch (errorCode) {
      case 'access_denied':
        return 'Please try again and click "Allow" when prompted to authorize the application.';
      case 'no_code':
      case 'token_exchange_failed':
        return 'Please try the connection process again. If the problem persists, contact support.';
      case 'invalid_state':
        return 'Please start the authorization process again from the beginning.';
      case 'server_error':
        return 'Please try again in a few minutes. If the problem persists, contact support.';
      default:
        return 'Please try the connection process again or contact support if the problem continues.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connection Failed
          </h1>
          
          <p className="text-gray-600 mb-4">
            {getErrorMessage(error)}
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-700">
              <span className="font-medium">Error:</span> {error || 'unknown_error'}
            </p>
          </div>
          
          <p className="text-gray-600 text-sm mb-6">
            {getErrorSolution(error)}
          </p>
          
          <div className="space-y-2">
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SquareError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}