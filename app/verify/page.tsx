'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Store token and user
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect to dashboard
      router.push('/dashboard'); 
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm">
          We sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email}</span>.
        </p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1.5">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            maxLength={6}
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            value={code}
            placeholder="000000"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors active:scale-[0.98]"
          >
            Verify &amp; Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900 items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-100 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8 text-slate-900">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="font-bold text-lg text-white leading-none">C</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">CrewSync</span>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyOTPForm />
        </Suspense>
      </div>
    </div>
  );
}
