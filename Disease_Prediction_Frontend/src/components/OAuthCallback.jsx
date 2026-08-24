import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

/**
 * OAuth Callback Handler for Wearable Device Authentication
 * Handles: Google Fit, Fitbit, Garmin callbacks
 */
export default function OAuthCallback() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Connecting to your device...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const provider = getProviderFromPath();

      if (error) {
        throw new Error(error);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for access token
      const token = await exchangeCodeForToken(provider, code);

      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: `${provider}-auth`,
          success: true,
          token: token,
        }, window.location.origin);
      }

      setStatus('success');
      setMessage(`Successfully connected to ${capitalize(provider)}!`);

      // Close window after short delay
      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (error) {
      console.error('OAuth error:', error);
      
      if (window.opener) {
        window.opener.postMessage({
          type: `${getProviderFromPath()}-auth`,
          success: false,
          error: error.message,
        }, window.location.origin);
      }

      setStatus('error');
      setMessage(`Failed to connect: ${error.message}`);

      setTimeout(() => {
        window.close();
      }, 3000);
    }
  };

  const getProviderFromPath = () => {
    const path = window.location.pathname;
    if (path.includes('google-fit')) return 'google-fit';
    if (path.includes('fitbit')) return 'fitbit';
    if (path.includes('garmin')) return 'garmin';
    return 'unknown';
  };

  const exchangeCodeForToken = async (provider, code) => {
    // This would call your backend API to exchange the code for a token
    // For security, the client secret should NEVER be in frontend code
    
    const response = await fetch('/api/auth/wearable/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        code,
        redirectUri: window.location.origin + window.location.pathname,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const data = await response.json();
    return data.accessToken;
  };

  const capitalize = (str) => {
    return str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        
        {status === 'processing' && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Connecting Device
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Connection Successful!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              This window will close automatically...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Connection Failed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              This window will close automatically...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
