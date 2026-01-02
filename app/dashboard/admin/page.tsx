'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  Plus, 
  Activity,
  BarChart3,
  Target,
  Zap,
  Star,
  Crown,
  Shield,
  Award,
  Sparkles,
  Eye,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  MessageSquare,
  Settings,
  FileText,
  Mail,
  Database
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'

// Mock data for admin dashboard
const mockSystemStats = {
  totalUsers: 245,
  totalEvents: 18,
  totalVolunteers: 156,
  activeOrganizers: 12,
  systemUptime: 99.9,
  dataUsage: 2.4,
  reportsGenerated: 45
}

const mockReports = [
  {
    id: '1',
    title: 'Volunteer Activity Report',
    type: 'PDF',
    date: new Date('2024-03-10'),
    size: '2.3 MB',
    status: 'completed'
  },
  {
    id: '2',
    title: 'Event Performance Analysis',
    type: 'Excel',
    date: new Date('2024-03-08'),
    size: '1.8 MB',
    status: 'completed'
  },
  {
    id: '3',
    title: 'User Engagement Report',
    type: 'PDF',
    date: new Date('2024-03-05'),
    size: '3.1 MB',
    status: 'processing'
  }
]

const mockCommunications = [
  {
    id: '1',
    title: 'System Maintenance Notice',
    recipients: 'All Users',
    status: 'sent',
    date: new Date('2024-03-12')
  },
  {
    id: '2',
    title: 'New Feature Announcement',
    recipients: 'Organizers',
    status: 'draft',
    date: new Date('2024-03-11')
  }
]

const ADMIN_EMAIL = 'admin@example.com' // Change this to your allowed admin email

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [sessionChecked, setSessionChecked] = useState(false)
  const [sessionDenied, setSessionDenied] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalShifts: 0,
    totalVolunteers: 0,
    activeOrganizers: 0,
    reportsGenerated: 45
  })
  const [reports, setReports] = useState<any[]>([])
  const [communications, setCommunications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let releaseSession = async () => {}
    if (user && user.email === ADMIN_EMAIL) {
      // TODO: Check admin session in your own database
      setSessionChecked(true)
      releaseSession = async () => {
        // TODO: Release session in your own database
      }
      window.addEventListener('beforeunload', releaseSession)
      })
    }
    return () => {
      window.removeEventListener('beforeunload', releaseSession)
      // Optionally release session on unmount
      if (user && user.email === ADMIN_EMAIL && sessionChecked && !sessionDenied) {
        // TODO: Release session in your own database
      }
    }
  }, [user])

  if (user && user.email === ADMIN_EMAIL && sessionDenied) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Admin Session Active</h2>
            <p className="text-gray-700 dark:text-gray-300">Admin is already logged in elsewhere. Please try again later.</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }
  if (user && user.email === ADMIN_EMAIL && !sessionChecked) {
    return null // or a loading spinner
  }

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      // TODO: Fetch stats from your own database
      let organizers = 0
      let reportsCount = 0
      setReports([])
      setCommunications([])
      setSystemStats(prev => ({
        ...prev,
        totalUsers: usersSnap.size,
        totalEvents: eventsSnap.size,
        totalShifts: shiftsSnap.size,
        activeOrganizers: organizers,
        reportsGenerated: reportsCount
      }))
      setIsLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-primary-600/10 rounded-full blur-3xl animate-pulse-glow"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Welcome back, {user?.email}! System administration and monitoring.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-300 text-sm">Live</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
            <Link href="/dashboard/admin/reports" className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 transition-all duration-300 shadow-lg group focus:outline-none">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Generate Reports</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Export data</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/admin/notifications" className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 transition-all duration-300 shadow-lg group focus:outline-none">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Send Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Communicate with users</p>
                </div>
              </div>
            </Link>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.totalUsers}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">+5%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.totalEvents}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">+12%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Shifts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemStats.totalShifts}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Recent Reports
              </h3>
              <span className="text-sm text-primary-600 dark:text-primary-400 opacity-50 cursor-not-allowed flex items-center">
                View all reports
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${
                          report.type === 'PDF' ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'
                        }`}>
                          <FileText className={`h-4 w-4 ${
                            report.type === 'PDF' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                          }`} />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">{report.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {report.type} • {report.size} • {report.date ? (typeof report.date === 'string' ? report.date : new Date(report.date.seconds ? report.date.seconds * 1000 : report.date).toLocaleDateString()) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {report.status}
                        </span>
                        <span className="p-2 text-gray-400 cursor-not-allowed">
                          <Download className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Communications Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Communications
              </h3>
              <span className="text-sm text-primary-600 dark:text-primary-400 opacity-50 cursor-not-allowed flex items-center">
                View all communications
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communications.map((comm) => (
                <div key={comm.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{comm.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">To: {comm.recipients}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comm.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {comm.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {comm.date ? (typeof comm.date === 'string' ? comm.date : new Date(comm.date.seconds ? comm.date.seconds * 1000 : comm.date).toLocaleDateString()) : ''}
                    </p>
                    <div className="flex space-x-2">
                      <span className="px-3 py-1 bg-primary-300 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
                        {comm.status === 'draft' ? 'Send' : 'Resend'}
                      </span>
                      <span className="px-3 py-1 border border-gray-300 dark:border-slate-600 text-gray-400 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
                        Edit
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
              <Shield className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              System Health
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Active Organizers</h4>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{systemStats.activeOrganizers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(systemStats.activeOrganizers / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Reports Generated</h4>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{systemStats.reportsGenerated}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(systemStats.reportsGenerated / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 