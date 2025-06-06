'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BASE_BACKEND_URL } from '@/config/constants';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, redirect to login
      router.push('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#004F9E]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h1 className="text-xl font-medium text-center text-gray-900 p-4">Create account</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-900 mb-1">
              Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              placeholder="Manoj Kumar"
              value={formData.full_name}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-900 placeholder-gray-600 text-sm h-9"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="manoj@richpanel.com"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="••••••••••••••"
              value={formData.password}
              onChange={handleChange}
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
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-900">
          Already have an account?{' '}
          <Link href="/login" className="text-[#004AAD] hover:underline cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
} 