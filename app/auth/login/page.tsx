'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { signInWithEmail, signInWithGoogle } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'volunteer' | 'organizer' | 'admin'>('volunteer')

  const isPasswordValid = (pwd: string) => {
    // Only allow numbers, alphabets, and special characters (no spaces, no emojis)
    // Regex: at least one character, no spaces, no emoji unicode blocks
    // This regex allows visible ASCII and common special chars, but not spaces or emoji
    // Adjust as needed for your allowed special chars
    return /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(pwd)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Password validation
    if (!isPasswordValid(password)) {
      toast.error('Password must not contain spaces or emojis. Only numbers, alphabets, and special characters are allowed.')
      setIsLoading(false)
      return
    }

    try {
      const { user, error } = await signInWithEmail(email, password)
      
      if (user) {
        // Fetch user role from Firestore if not present
        let role = (user as any).role;
        if (!role) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            role = userDoc.data().role;
          }
        }
        toast.success('Login successful!')
        if (role === 'volunteer') {
          router.push('/dashboard/volunteer');
        } else if (role === 'organizer') {
          router.push('/dashboard/organizer');
        } else if (role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Check for specific Firebase auth errors
        if (error?.includes('user-not-found') || error?.includes('no user record')) {
          toast.error('Account not found. Please create a new account first.')
        } else if (error?.includes('wrong-password') || error?.includes('invalid-credential')) {
          toast.error('Incorrect email or password. Please check your credentials and try again.')
        } else if (error?.includes('invalid-email')) {
          toast.error('Invalid email address. Please check your email format.')
        } else if (error?.includes('user-disabled')) {
          toast.error('This account has been disabled. Please contact support.')
        } else if (error?.includes('too-many-requests')) {
          toast.error('Too many failed attempts. Please try again later.')
        } else if (error?.includes('network-request-failed')) {
          toast.error('Network error. Please check your internet connection.')
        } else {
          toast.error('Login failed. Please check your credentials and try again.')
        }
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const { user, error } = await signInWithGoogle()
      if (user) {
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)
        let role = undefined
        if (!userDocSnap.exists()) {
          toast.error('This is your first time signing in with Google. Please use Sign Up instead.')
          setIsLoading(false)
          return
        } else {
          role = userDocSnap.data().role
        }
        toast.success('Google Sign-In successful!')
        if (role === 'volunteer') {
          router.push('/dashboard/volunteer')
        } else if (role === 'organizer') {
          router.push('/dashboard/organizer')
        } else if (role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        // Check for specific Google auth errors
        if (error?.includes('account-exists-with-different-credential')) {
          toast.error('An account already exists with this email using a different sign-in method.')
        } else if (error?.includes('popup-closed-by-user')) {
          toast.error('Sign-in was cancelled. Please try again.')
        } else if (error?.includes('invalid-credential')) {
          toast.error('Invalid credentials. Please try again.')
        } else if (error?.includes('network-request-failed')) {
          toast.error('Network error. Please check your internet connection.')
        } else if (error?.includes('auth-domain-not-configured')) {
          toast.error('Authentication domain not configured. Please contact support.')
        } else {
          toast.error('Google Sign-In failed. Please try again.')
        }
      }
    } catch (error) {
      toast.error('Google Sign-In failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-500">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Or{' '}
          <Link href="/auth/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
            create a new account
          </Link>
        </p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            <strong>New to CrewSync?</strong> Create an account to get started with volunteer management.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full btn-lg"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a...</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as 'volunteer' | 'organizer' | 'admin')}
                className="input w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2"
              >
                <option value="volunteer">Volunteer</option>
                <option value="organizer">Event Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="btn btn-secondary w-full btn-lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M1.82 12c0-1.02.17-2.01.47-2.94v-2.84h5.1c.29-.86.7-1.67 1.2-2.39L5.1 3.1C3.24 4.98 2 8.22 2 12c0 1.3.18 2.55.5 3.72l3.57-2.77C5.17 12.01 5 12 5 12z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 