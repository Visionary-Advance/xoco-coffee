// components/SquareOAuthButton.js
'use client';

import { useState } from 'react';

export default function SquareOAuthButton() {
  const [copied, setCopied] = useState(false);

  // Generate OAuth URL
  const generateOAuthURL = (environment = 'local') => {
    const baseURL = environment === 'local' 
      ? 'http://localhost:3000'
      : 'https://yourdomain.com'; // Replace with your actual domain
    
    const params = new URLSearchParams({
      client_id: 'sandbox-sq0idb-2WkL1ufAbW00UfB37SVB5g',
      scope: 'PAYMENTS_READ PAYMENTS_WRITE ORDERS_READ ORDERS_WRITE',
      response_type: 'code',
      redirect_uri: `${baseURL}/api/square/callback`,
      state: 'unique_state_value_123' // Change this to a random value for security
    });

    return `https://connect.squareup.com/oauth2/authorize?${params.toString()}`;
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Square OAuth Integration</h2>
      
      <div className="space-y-6">
        {/* Local Development URL */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Local Development URL</h3>
          <p className="text-sm text-gray-600 mb-3">
            Use this URL when testing locally (http://localhost:3000)
          </p>
          <div className="bg-gray-50 p-3 rounded border">
            <code className="text-sm break-all">
              {generateOAuthURL('local')}
            </code>
          </div>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => copyToClipboard(generateOAuthURL('local'))}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <a
              href={generateOAuthURL('local')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Test OAuth Flow
            </a>
          </div>
        </div>

        {/* Production URL */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Production URL Template</h3>
          <p className="text-sm text-gray-600 mb-3">
            Replace "yourdomain.com" with your actual domain for production
          </p>
          <div className="bg-gray-50 p-3 rounded border">
            <code className="text-sm break-all">
              {generateOAuthURL('production')}
            </code>
          </div>
          <button
            onClick={() => copyToClipboard(generateOAuthURL('production'))}
            className="mt-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Copy Production URL
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Setup Instructions</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside">
            <li>Get your Client Secret from Square Developer Dashboard</li>
            <li>Add it to your .env.local file</li>
            <li>Configure the redirect URI in Square Dashboard: <code>http://localhost:3000/api/square/callback</code></li>
            <li>Send the OAuth URL to your client</li>
            <li>Client clicks the URL and authorizes your app</li>
            <li>Tokens will be received in your callback endpoint</li>
          </ol>
        </div>

        {/* Configuration Checklist */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Square Dashboard Configuration</h3>
          <p className="text-sm mb-3">Make sure these are configured in your Square Developer Dashboard:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li><strong>Application ID:</strong> sandbox-sq0idb-2WkL1ufAbW00UfB37SVB5g</li>
            <li><strong>Redirect URI:</strong> http://localhost:3000/api/square/callback</li>
            <li><strong>Permissions:</strong> Payments Read, Payments Write, Orders Read, Orders Write</li>
          </ul>
        </div>
      </div>
    </div>
  );
}