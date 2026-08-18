'use client'; // Required for forms in Next.js App Router

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Note: Replace with actual client ID
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard'); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data && data.requiresVerification) {
           router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
           return;
        }
        if (data) {
           throw new Error(data.error || 'Invalid credentials');
        } else {
           throw new Error('Something went wrong during login');
        }
      }

      // 1. Store the JWT token
      localStorage.setItem('token', data.token);
      
      // 2. Strict nested check for user object before storing
      if (data) {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      // 3. Redirect to the dashboard
      router.push('/dashboard'); 
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="flex min-h-screen w-full bg-white font-sans text-slate-900">
        
        {/* Left Panel: Branding & Marketing */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between bg-slate-900 p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="font-bold text-lg leading-none">C</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">CrewSync</span>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-6 leading-snug">
              Streamline your event management workflow.
            </h1>
            <p className="text-lg text-slate-400">
              Log in to manage your events, coordinate with volunteers, and oversee administrative tasks from one unified dashboard.
            </p>
          </div>

          <div className="relative z-10 text-sm text-slate-500">
            &copy; {new Date().getFullYear()} CrewSync. All rights reserved.
          </div>
        </div>

        {/* Right Panel: Functional Login Form */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 sm:p-12 md:p-24 bg-slate-50 lg:bg-white">
          
          <div className="w-full max-w-sm">
            <div className="flex lg:hidden items-center gap-2 mb-8 text-slate-900">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="font-bold text-lg text-white leading-none">C</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">CrewSync</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h2>
              <p className="text-slate-500 text-sm">Please login with Google or your Email to continue.</p>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Google OAuth Button */}
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed')}
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-slate-50 lg:bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-colors"
                  onChange={handleChange}
                  value={formData.email}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-colors"
                  onChange={handleChange}
                  value={formData.password}
                  placeholder="Enter Password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors active:scale-[0.98]"
                >
                  Login
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline underline-offset-4 transition-colors">
                Register
              </Link>
            </p>

          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}