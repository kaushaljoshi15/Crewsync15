'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { onAuthChange } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { User as AppUser } from '@/lib/types'

interface AuthContextType {
  user: (FirebaseUser & { role?: string }) | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(FirebaseUser & { role?: string }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userDoc = await getDoc(userRef)
        let role = undefined
        if (userDoc.exists()) {
          const data = userDoc.data()
          role = data.role
          console.log('[AuthProvider] User role from Firestore:', role)
        } else {
          // If user does not exist, create with default role 'volunteer'
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || '',
            role: 'volunteer', // Default role
          })
          role = 'volunteer'
          console.log('[AuthProvider] Created new user with default role:', role)
        }
        console.log('[AuthProvider] Setting user with role:', role)
        setUser({ ...firebaseUser, role })
      } else {
        console.log('[AuthProvider] No user logged in')
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
} 