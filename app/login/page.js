'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BASE_BACKEND_URL } from '@/config/constants';
import Cookies from 'js-cookie';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save the token in cookies
      const expiryDays = rememberMe ? 30 : 1;
      Cookies.set('token', data.access_token, { expires: expiryDays });
      Cookies.set('token_type', data.token_type, { expires: expiryDays });

      // Redirect to home page
      router.push('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E4D91]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h1 className="text-xl font-medium text-center text-gray-900 p-6">Login to your account</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder='manoj@richpanel.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-900 placeholder-gray-600 text-sm h-9"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder='••••••••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-900 placeholder-gray-400 text-sm h-9"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-900">
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004AAD] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium cursor-pointer"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-900">
          New to MyApp?{' '}
          <Link href="/register" className="text-[#004AAD] hover:underline cursor-pointer">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
} 