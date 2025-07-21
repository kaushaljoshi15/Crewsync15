'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { signUpWithEmail, signInWithGoogle } from '@/lib/auth'
import { setDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer' as 'organizer' | 'volunteer' | 'admin'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const isPasswordValid = (pwd: string) => {
    // Only allow numbers, alphabets, and special characters (no spaces, no emojis)
    // Regex: at least one character, no spaces, no emoji unicode blocks
    // This regex allows visible ASCII and common special chars, but not spaces or emoji
    // Adjust as needed for your allowed special chars
    return /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(pwd)
  }

  const isEmailValid = (email: string) => {
    // Email must start with an alphabet, then allow valid email characters (alphanumeric, dot, underscore, hyphen, plus), then @, then domain
    // No emojis or disallowed special characters
    // Example: /^[a-zA-Z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    // This does not allow emojis or special chars at the start
    return /^[a-zA-Z][a-zA-Z0-9._+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Email validation
    if (!isEmailValid(formData.email)) {
      toast.error('Email must start with an alphabet and contain only valid email characters (no emojis or special characters).')
      setIsLoading(false)
      return
    }

    // Password validation
    if (!isPasswordValid(formData.password) || !isPasswordValid(formData.confirmPassword)) {
      toast.error('Password must not contain spaces or emojis. Only numbers, alphabets, and special characters are allowed.')
      setIsLoading(false)
      return
    }

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error('Please fill in all required fields')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long')
        return
      }

      const { user, error } = await signUpWithEmail(formData.email, formData.password)
      
      if (user) {
        // Write user to Firestore with selected role
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: formData.email,
          name: formData.name,
          role: formData.role,
        })
        toast.success('🎉 Account created successfully! Welcome to CrewSync!')
        if (formData.role === 'volunteer') {
          router.push('/dashboard/volunteer');
        } else if (formData.role === 'organizer') {
          router.push('/dashboard/organizer');
        } else if (formData.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Check for specific Firebase auth errors
        if (error?.includes('email-already-in-use')) {
          toast.error('An account with this email already exists. Please sign in instead.')
        } else if (error?.includes('weak-password')) {
          toast.error('Password is too weak. Please choose a stronger password (at least 6 characters).')
        } else if (error?.includes('invalid-email')) {
          toast.error('Invalid email address. Please check your email format.')
        } else if (error?.includes('invalid-credential')) {
          toast.error('Invalid credentials. Please check your information and try again.')
        } else if (error?.includes('network-request-failed')) {
          toast.error('Network error. Please check your internet connection.')
        } else if (error?.includes('operation-not-allowed')) {
          toast.error('Email/password sign-up is not enabled. Please contact support.')
        } else {
          toast.error('Registration failed. Please check your information and try again.')
        }
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      const { user, error } = await signInWithGoogle()
      if (user) {
        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)
        let role = formData.role || 'volunteer'
        if (!userDocSnap.exists()) {
          // Create user doc with selected role
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: user.displayName || '',
            role,
          })
          toast.success(`Google Sign-Up successful! Role set to ${role}.`)
        } else {
          // Update role to selected role if changed
          if (userDocSnap.data().role !== role) {
            await setDoc(userDocRef, {
              ...userDocSnap.data(),
              role,
            })
            toast.success(`Role updated to ${role}.`)
          } else {
            toast.success('Google Sign-Up successful!')
          }
        }
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
          toast.error('Sign-up was cancelled. Please try again.')
        } else if (error?.includes('invalid-credential')) {
          toast.error('Invalid credentials. Please try again.')
        } else if (error?.includes('network-request-failed')) {
          toast.error('Network error. Please check your internet connection.')
        } else {
          toast.error('Google Sign-Up failed. Please try again.')
        }
      }
    } catch (error) {
      toast.error('Google Sign-Up failed. Please try again.')
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
            sign in to your existing account
          </Link>
        </p>
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 text-center">
            <strong>Welcome to CrewSync!</strong> Create your account to start managing volunteer events.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input pl-10 pr-10"
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a...</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="input w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2"
              >
                <option value="volunteer">Volunteer</option>
                <option value="organizer">Event Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full btn-lg"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="relative mt-8">
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
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="btn btn-secondary w-full btn-lg mt-4"
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
                Sign up with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 