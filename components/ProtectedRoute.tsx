'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login')
      } else if (allowedRoles && !allowedRoles.includes(user.role || '')) {
        // Redirect to their correct dashboard based on role
        if (user.role === 'organizer') router.replace('/dashboard/organizer')
        else if (user.role === 'volunteer') router.replace('/dashboard/volunteer')
        else if (user.role === 'admin') router.replace('/dashboard/admin')
        else router.replace('/auth/login')
      }
    }
  }, [user, loading, allowedRoles, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    return null
  }

  return <>{children}</>
} 