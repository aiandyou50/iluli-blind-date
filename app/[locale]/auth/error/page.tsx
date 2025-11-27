'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/debug/config');
      const data = await res.json();
      setDebugInfo(data);
    } catch (e) {
      setDebugInfo({ error: 'Failed to fetch debug info' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <div className="mb-6 flex justify-center text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Authentication Error
        </h1>
        
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
          {error || 'An unknown error occurred during authentication.'}
        </p>

        <div className="mb-6 rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-700">
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">Error Code:</p>
          <p className="font-mono font-bold text-red-600 dark:text-red-400">{error}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={checkConfig}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-600 dark:hover:bg-gray-500"
          >
            {loading ? 'Checking Configuration...' : 'Debug: Check Server Config'}
          </button>

          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Return to Home
          </Link>
        </div>

        {debugInfo && (
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <div className="border-b border-gray-200 bg-gray-100 px-4 py-2 text-xs font-bold uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              Debug Report
            </div>
            <pre className="max-h-60 overflow-auto p-4 text-xs text-gray-700 dark:text-gray-300">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
