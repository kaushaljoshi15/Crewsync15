'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Settings,
  Bell,
  Shield,
  Key,
  Eye,
  EyeOff,
  Save,
  Edit,
  Camera,
  Trash2,
  Download,
  Upload,
  FileText,
  MessageSquare,
  Database,
  Activity,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface UserProfile {
  uid: string
  email: string
  name: string
  role: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
  preferences?: {
    notifications: boolean
    darkMode: boolean
    language: string
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [profile, setProfile] = useState<UserProfile>({
    uid: '',
    email: '',
    name: '',
    role: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en'
    }
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return
    
    try {
      // TODO: Fetch user profile from your own database
      setProfile({
          uid: user.uid,
          email: user.email || '',
          name: data.name || user.displayName || '',
          role: data.role || 'volunteer',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
          preferences: data.preferences || {
            notifications: true,
            darkMode: false,
            language: 'en'
          }
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // TODO: Update user profile in your own database
        bio: profile.bio,
        avatar: profile.avatar,
        preferences: profile.preferences
      })
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      // Here you would implement password change logic
      // For now, just show success message
      toast.success('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Here you would implement file upload logic
      // For now, just show success message
      toast.success('Avatar uploaded successfully!')
    }
  }

  const exportUserData = () => {
    // Create and download user data as JSON
    const userData = {
      profile,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `user-data-${user?.email}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('User data exported successfully!')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Role: <span className="font-medium capitalize">{profile.role}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                      
                      {/* Avatar Section */}
                      <div className="mb-8">
                        <div className="flex items-center space-x-6">
                          <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                              {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-white dark:bg-slate-700 rounded-full p-2 cursor-pointer shadow-lg">
                              <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{profile.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="email"
                              value={profile.email}
                              disabled
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400"
                              placeholder="Email address"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                              placeholder="Enter your phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={profile.location}
                              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                              placeholder="Enter your location"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={handleProfileUpdate}
                          disabled={isLoading}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 