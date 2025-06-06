'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut } from 'react-icons/fi';
import { BASE_BACKEND_URL, BASE_FRONTEND_URL } from '@/config/constants';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [fbAuthUrl, setFbAuthUrl] = useState('');
  const [fbConnection, setFbConnection] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BASE_BACKEND_URL}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        router.push('/login');
      }
    };

    // Fetch Facebook auth URL
    const fetchFbAuthUrl = async () => {
      try {
        const response = await fetch(`${BASE_BACKEND_URL}/facebook/auth?redirect_uri=${BASE_FRONTEND_URL}/fb_oauth/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Facebook auth URL');
        }
        const data = await response.json();
        setFbAuthUrl(data.auth_url);
      } catch (error) {
        console.error('Error fetching Facebook auth URL:', error);
      }
    };

    // Fetch Facebook connection status
    const fetchFbConnection = async () => {
      try {
        const response = await fetch(`${BASE_BACKEND_URL}/facebook/connection`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Facebook connection status');
        }
        const data = await response.json();
        setFbConnection(data);
      } catch (error) {
        console.error('Error fetching Facebook connection status:', error);
      }
    };

    fetchUserData();
    fetchFbAuthUrl();
    fetchFbConnection();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    router.push('/login');
  };

  const handleDisconnect = async (pageId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/facebook/disconnect/${pageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFbConnection({ connected: 0, page: null });
        setError('');
      } else {
        setError("Couldn't disconnect page");
      }
    } catch (error) {
      console.error('Error disconnecting page:', error);
      setError("Couldn't disconnect page");
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#004F9E]">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="mx-5 border-2 border-white text-white px-6 py-1.5 rounded-lg hover:bg-white hover:text-[#004F9E] transition-all text-base flex items-center gap-2 cursor-pointer"
        >
          <FiLogOut className="text-xl" />
          Logout
        </button>
      </div>
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-md p-8 w-[500px] max-w-3xl">
          <h2 className="text-xl font-medium mb-2 mt-4 text-gray-900 text-center">
            Facebook Page Integration
          </h2>
          <div className="mt-4">
            {fbConnection?.connected === 1 ? (
              <div className="bg-white rounded-lg">
                <h3 className="text-center text-lg font-medium mb-4 text-gray-900 mb-8">
                  Integrated Page: <span className="font-bold">{fbConnection.page.name}</span>
                 </h3>

                <div className="flex flex-col gap-3 p-5">
                  <button
                    onClick={() => handleDisconnect(fbConnection.page.id)}
                    className="w-auto bg-red-500 font-medium text-white py-3 rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    Delete Integration
                  </button>
                  <Link
                    href="/chat"
                    className="w-auto bg-[#004F9E] text-white py-3 rounded-md hover:bg-blue-900 transition-colors text-center cursor-pointer"
                  >
                    Reply To Messages
                  </Link>
                </div>
                {error && (
                  <p className="mt-2 text-red-600">{error}</p>
                )}
              </div>
            ) : (
                <div className="flex justify-center">
                  <a
                    href={fbAuthUrl}
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-900 font-medium text-md text-white px-20 py-3 rounded-md hover:bg-blue-800 transition-colors text-center cursor-pointer"
                  >
                    Connect Page
                  </a>
                </div>

            )}
          </div>
        </div>
      </main>
    </div>
  );
} 