import { auth } from './firebase'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import performance from './performance'

export const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  try {
    performance.trackAuthEvent('login')
    const result = await signInWithPopup(auth, googleProvider)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    performance.trackAuthEvent('login')
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    performance.trackAuthEvent('signup')
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function signOutUser() {
  try {
    performance.trackAuthEvent('logout')
    await signOut(auth)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
} 