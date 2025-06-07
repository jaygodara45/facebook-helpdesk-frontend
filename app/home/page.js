'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut } from 'react-icons/fi';
import { MdHome, MdInbox, MdPeople, MdSettings, MdLogout } from 'react-icons/md';
import { BsFillChatLeftTextFill } from 'react-icons/bs';
import { BASE_BACKEND_URL, BASE_FRONTEND_URL } from '@/config/constants';
import Cookies from 'js-cookie';

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [fbAuthUrl, setFbAuthUrl] = useState('');
  const [fbConnection, setFbConnection] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
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
        Cookies.remove('token');
        Cookies.remove('token_type');
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
    Cookies.remove('token');
    Cookies.remove('token_type');
    router.push('/login');
  };

  const handleDisconnect = async (pageId) => {
    const token = Cookies.get('token');
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
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1E4D91] flex">
      {/* Tall Bar */}
      <div className="w-[5%] bg-[#1E4D91] flex flex-col items-center py-6 text-white">
        <div className="flex flex-col items-center space-y-8">
          <button 
            className="p-3 rounded-lg bg-blue-700 transition-colors cursor-pointer"
          >
            <MdHome size={28} />
          </button>
          <button 
            onClick={() => router.push('/chat')}
            className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer group relative"
          >
            <BsFillChatLeftTextFill size={24} />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Go to Chats
            </span>
          </button>
          <button className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <MdInbox size={24} />
          </button>
          <button className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <MdPeople size={24} />
          </button>
        </div>
        <div className="mt-auto flex flex-col items-center space-y-8">
          <button className="p-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <MdSettings size={24} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-3 rounded-lg hover:bg-blue-700 transition-colors group relative cursor-pointer"
          >
            <MdLogout size={24} />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Logout
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="absolute top-4 right-4">
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
                      className="w-auto bg-[#1E4D91] text-white py-3 rounded-md hover:bg-blue-900 transition-colors text-center cursor-pointer"
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
    </div>
  );
} 