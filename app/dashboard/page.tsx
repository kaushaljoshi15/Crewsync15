'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      console.log('[Dashboard] User role:', user.role)
      // Redirect to role-specific dashboard
      if (user.role === 'organizer') {
        console.log('[Dashboard] Redirecting to organizer dashboard')
        router.replace('/dashboard/organizer')
      } else if (user.role === 'admin') {
        console.log('[Dashboard] Redirecting to admin dashboard')
        router.replace('/dashboard/admin')
      } else if (user.role === 'volunteer') {
        console.log('[Dashboard] Redirecting to volunteer dashboard')
        router.replace('/dashboard/volunteer')
      } else {
        console.log('[Dashboard] No role found, defaulting to volunteer')
        // Default to volunteer if no role
        router.replace('/dashboard/volunteer')
      }
    }
  }, [user, loading, router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Redirecting to your dashboard...</p>
        </div>
      </div>
    </ProtectedRoute>
  )
} 