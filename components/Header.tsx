'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, User, Settings, Menu, X, Moon, Sun } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useTheme } from './ThemeProvider'
import { signOutUser } from '@/lib/auth'
import toast from 'react-hot-toast'

export default function Header() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      const { error } = await signOutUser()
      if (error) {
        toast.error('Sign out failed. Please try again.')
      } else {
        toast.success('Signed out successfully')
        router.push('/')
      }
    } catch (error) {
      toast.error('Sign out failed. Please try again.')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              CrewSync
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {/* Only show Events and Shifts for non-volunteers */}
                {user.role !== 'volunteer' && (
                  <>
                <Link
                      href={user.role === 'organizer' ? '/dashboard/organizer/event' : '/events'}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Events
                </Link>
                <Link
                  href="/shifts"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Shifts
                </Link>
                  </>
                )}
                
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden lg:block">{user.email}</span>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-slate-700">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsDropdownOpen(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-700" />
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn btn-primary btn-sm"
                >
                  Get Started
                </Link>
                {/* Show theme toggle on home page only, right of Get Started */}
                {pathname === '/' && (
                  <button
                    onClick={toggleTheme}
                    className="ml-2 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 shadow hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <Moon className="h-5 w-5 text-gray-700" />
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-gradient-to-br from-primary-900/90 via-slate-900/80 to-primary-700/80 dark:from-slate-900/95 dark:via-primary-900/90 dark:to-slate-800/90 backdrop-blur-lg border-r border-primary-700/30 shadow-2xl rounded-r-3xl p-8 flex flex-col gap-8 z-50 md:hidden animate-slide-in">
            {/* Logo and Close */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 via-primary-300 to-primary-600 bg-clip-text text-transparent drop-shadow-lg select-none">CrewSync</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-3 rounded-full hover:bg-primary-800/30 transition text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400">
                <X className="h-7 w-7" />
              </button>
            </div>
            <nav className="flex flex-col gap-4">
              {user && (
                <div className="mb-6 border-b border-gray-200 dark:border-slate-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center text-lg font-bold text-primary-700 dark:text-primary-300">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{user.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                    </div>
                  </div>
                </div>
              )}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900 transition font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>🏠</span> Dashboard
                  </Link>
                  {/* Only show Events and Shifts for non-volunteers */}
                  {user.role !== 'volunteer' && (
                    <>
                      <Link
                        href={user.role === 'organizer' ? '/dashboard/organizer/event' : '/events'}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900 transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>📅</span> Events
                      </Link>
                      <Link
                        href="/shifts"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900 transition"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>🕒</span> Shifts
                      </Link>
                    </>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" /> Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-primary-100 dark:hover:bg-primary-900 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" /> Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition"
                    >
                    <LogOut className="h-5 w-5" /> Sign Out
                    </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-3 px-5 py-3 rounded-full bg-primary-800/30 text-primary-100 hover:bg-primary-700/40 hover:text-white transition font-semibold shadow-sm mb-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 text-primary-300" />
                    <span>Sign In</span>
                  </Link>
                  <div className="flex items-center my-2">
                    <div className="flex-grow h-px bg-gradient-to-r from-primary-700/30 via-primary-400/40 to-primary-700/30" />
                  </div>
                  <Link
                    href="/auth/register"
                    className="w-full py-3 rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 text-white font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-150 text-center mt-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 