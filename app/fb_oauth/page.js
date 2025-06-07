'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HomeIcon } from '@heroicons/react/24/solid';
import { BASE_BACKEND_URL, BASE_FRONTEND_URL } from '@/config/constants';
import Cookies from 'js-cookie';

export default function FacebookOAuth() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code found');
      setIsLoading(false);
      return;
    }

    const connectFacebookPage = async () => {
      try {
        const token = Cookies.get('token');
        const response = await fetch(`${BASE_BACKEND_URL}/facebook/connect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: `${BASE_FRONTEND_URL}/fb_oauth/`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to connect Facebook page');
        }

        const data = await response.json();
        setResponse(data);
      } catch (error) {
        console.error('Error connecting Facebook page:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    connectFacebookPage();
  }, [searchParams]);

  useEffect(() => {
    if (response?.success === true || error) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [response, error]);

  // Separate useEffect for navigation
  useEffect(() => {
    if (countdown === 0) {
      router.push('/home');
    }
  }, [countdown, router]);

  // Only render content after component is mounted on client
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1E4D91] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Facebook Page Connection Status</h1>
        {error ? (
          <div className="space-y-4">
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p className="text-xl font-semibold">Connection Failed</p>
              <p className="mt-2">Error: {error}</p>
            </div>
            <div className="text-gray-900">
              Redirecting to home in {countdown} seconds...
            </div>
            <button 
              onClick={() => router.push('/home')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go to Home
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg">
              <p className="text-xl font-semibold">Connected to App Successfully!</p>
            </div>
            <div className="text-gray-900">
              Redirecting to home in {countdown} seconds...
            </div>
            <button 
              onClick={() => router.push('/home')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 