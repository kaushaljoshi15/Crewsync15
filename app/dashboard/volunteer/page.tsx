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
  Bell,
  MapPin,
  User,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Event, Volunteer } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Dialog } from '@headlessui/react'
import { formatTimeRange } from '@/lib/utils'

// Mock data for volunteer dashboard
const mockShifts = [
  {
    id: '1',
    eventTitle: 'Tech Conference 2024',
    title: 'Registration Desk',
    startTime: new Date('2024-03-15T09:00:00'),
    endTime: new Date('2024-03-15T11:00:00'),
    location: 'Main Entrance',
    status: 'confirmed',
    duty: 'Register attendees and provide information',
    priority: 'high'
  },
  {
    id: '2',
    eventTitle: 'Community Festival',
    title: 'Crowd Control',
    startTime: new Date('2024-04-20T11:00:00'),
    endTime: new Date('2024-04-20T13:00:00'),
    location: 'Auditorium',
    status: 'assigned',
    duty: 'Manage crowd flow and assist attendees',
    priority: 'medium'
  }
]

const mockNotifications = [
  {
    id: '1',
    title: 'Shift Reminder',
    message: 'Your shift at Tech Conference starts in 2 hours',
    time: '2 hours ago',
    type: 'reminder'
  },
  {
    id: '2',
    title: 'New Assignment',
    message: 'You have been assigned to Crowd Control at Community Festival',
    time: '1 day ago',
    type: 'assignment'
  }
]

export default function VolunteerDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [shifts, setShifts] = useState(mockShifts)
  const [notifications, setNotifications] = useState(mockNotifications)
  const [totalShifts, setTotalShifts] = useState(0)
  const [completedShifts, setCompletedShifts] = useState(0)
  const [hoursVolunteered, setHoursVolunteered] = useState(0)
  const [satisfactionScore, setSatisfactionScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  // New state for available and joined events
  const [availableEvents, setAvailableEvents] = useState<Event[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [unreadNotifCount, setUnreadNotifCount] = useState(0)

  // Fetch available and joined events for volunteer
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    // Fetch available events (active & public)
    const fetchAvailableEvents = async () => {
      const q = query(collection(db, 'events'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const events: Event[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            date: data.date ? new Date(data.date.seconds ? data.date.seconds * 1000 : data.date) : new Date(),
            location: data.location || '',
            organizerId: data.organizerId || '',
            organizerName: data.organizerName || '',
            status: data.status || 'draft',
            createdAt: data.createdAt ? new Date(data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds ? data.updatedAt.seconds * 1000 : data.updatedAt) : new Date(),
            ...data
          } as Event;
        })
        // Optionally filter for public events if you have a 'public' field
        .filter((event: any) => event.public !== false);
      setAvailableEvents(events);
    };
    // Fetch joined events for this volunteer
    const fetchJoinedEvents = async () => {
      const vq = query(collection(db, 'volunteers'), where('userId', '==', user.uid));
      const vSnap = await getDocs(vq);
      const eventIds = vSnap.docs.map(doc => doc.data().eventId);
      if (eventIds.length === 0) {
        setJoinedEvents([]);
        return;
      }
      // Fetch event details for joined events
      const joined: Event[] = [];
      for (const eventId of eventIds) {
        const eventDoc = await getDocs(query(collection(db, 'events'), where('__name__', '==', eventId)));
        eventDoc.forEach(doc => {
          const data = doc.data();
          joined.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            date: data.date ? new Date(data.date.seconds ? data.date.seconds * 1000 : data.date) : new Date(),
            location: data.location || '',
            organizerId: data.organizerId || '',
            organizerName: data.organizerName || '',
            status: data.status || 'draft',
            createdAt: data.createdAt ? new Date(data.createdAt.seconds ? data.createdAt.seconds * 1000 : data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds ? data.updatedAt.seconds * 1000 : data.updatedAt) : new Date(),
            ...data
          } as Event);
        });
      }
      setJoinedEvents(joined);
    };
    // Fetch real-time stats for volunteer
    const fetchStats = async () => {
      // Fetch all shifts assigned to this volunteer
      const shiftQ = query(collection(db, 'shifts'), where('assignedVolunteers', 'array-contains', user.uid));
      const shiftSnap = await getDocs(shiftQ);
      const shiftList: any[] = shiftSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTotalShifts(shiftList.length);
      // Completed shifts: status === 'completed'
      setCompletedShifts(shiftList.filter(s => (s as any).status === 'completed').length);
      // Hours volunteered: sum of (endTime - startTime) in hours
      let hours = 0;
      shiftList.forEach(s => {
        const startTime = (s as any).startTime;
        const endTime = (s as any).endTime;
        if (startTime && endTime) {
          const start = typeof startTime === 'string' ? new Date(startTime) : startTime.toDate ? startTime.toDate() : startTime;
          const end = typeof endTime === 'string' ? new Date(endTime) : endTime.toDate ? endTime.toDate() : endTime;
          hours += (end - start) / (1000 * 60 * 60);
        }
      });
      setHoursVolunteered(Math.round(hours));
      // Fetch satisfactionScore from user doc if available
      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
      let score = 0;
      userDoc.forEach(doc => {
        score = doc.data().satisfactionScore ?? 0;
      });
      setSatisfactionScore(score);
    };
    fetchStats();
    fetchAvailableEvents();
    fetchJoinedEvents();
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Fetch unread notifications for this user and global
    const fetchUnreadNotifications = async () => {
      const userQ = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('read', '==', false));
      const globalQ = query(collection(db, 'notifications'), where('userId', '==', 'all'), where('read', '==', false));
      const [userSnap, globalSnap] = await Promise.all([
        getDocs(userQ),
        getDocs(globalQ),
      ]);
      setUnreadNotifCount(userSnap.size + globalSnap.size);
    };
    fetchUnreadNotifications();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['volunteer']}>
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
                  Volunteer Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Welcome back, {user?.email}! Track your shifts and impact.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-300 text-sm">Live</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => router.push('/shifts')}
              className="group bg-gradient-to-br from-primary-600 to-primary-500 dark:from-primary-700 dark:to-primary-600 p-6 rounded-2xl border border-transparent hover:border-primary-400 transition-all duration-300 shadow-xl flex items-center gap-4 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <div className="p-3 bg-white/20 rounded-xl shadow-lg flex items-center justify-center">
                <Calendar className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                </div>
              <div>
                <h4 className="font-semibold text-white text-lg">View Shifts</h4>
                <p className="text-sm text-primary-100">Check your schedule</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/dashboard/volunteer/notifications')}
              className="group bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-700 p-6 rounded-2xl border border-transparent hover:border-indigo-400 transition-all duration-300 shadow-xl flex items-center gap-4 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400 relative"
            >
              <div className="p-3 bg-white/20 rounded-xl shadow-lg flex items-center justify-center relative">
                <Bell className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border-2 border-white dark:border-slate-800 animate-bounce">
                    {unreadNotifCount}
                  </span>
                )}
                </div>
              <div>
                <h4 className="font-semibold text-white text-lg">Notifications</h4>
                <p className="text-sm text-indigo-100">View updates</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/dashboard/volunteer/availability')}
              className="group bg-gradient-to-br from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 p-6 rounded-2xl border border-transparent hover:border-yellow-400 transition-all duration-300 shadow-xl flex items-center gap-4 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <div className="p-3 bg-white/20 rounded-xl shadow-lg flex items-center justify-center">
                <User className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
                </div>
              <div>
                <h4 className="font-semibold text-white text-lg">Update Availability</h4>
                <p className="text-sm text-yellow-100">Mark your status</p>
              </div>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Shifts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalShifts}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">+2</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedShifts}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">+1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{hoursVolunteered}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">+3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Rating</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{satisfactionScore}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-green-500">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span className="text-xs">+0.1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer Event Sections */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300 flex items-center gap-2">
              <Calendar className="h-6 w-6" /> Available Events
            </h2>
            {isLoading ? (
              <div className="text-gray-500 dark:text-gray-300">Loading events...</div>
            ) : availableEvents.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-300">No available events at this time.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableEvents.map(event => (
                  <div key={event.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date instanceof Date ? event.date.toLocaleDateString() : String(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      {/* Roles Needed and Progress (if available) */}
                      {/* You can add more event info here if your schema supports it */}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Join Event
                      </button>
                      <Link href={`/dashboard/volunteer/event/${event.id}`} className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-center">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300 flex items-center gap-2">
              <Users className="h-6 w-6" /> My Joined Events
            </h2>
            {isLoading ? (
              <div className="text-gray-500 dark:text-gray-300">Loading joined events...</div>
            ) : joinedEvents.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-300">You have not joined any events yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedEvents.map(event => (
                  <div key={event.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date instanceof Date ? event.date.toLocaleDateString() : String(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      {/* Show status if available (e.g., Confirmed/Pending/Checked-in) */}
                      {/* You can fetch and display volunteer status per event if needed */}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/dashboard/volunteer/event/${event.id}`} className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-center">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Shifts */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Crown className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Your Upcoming Shifts
              </h3>
              <Link
                href="/shifts"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-400 transition-colors flex items-center"
              >
                View all shifts
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shifts.map((shift, index) => (
                <div key={shift.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{shift.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{shift.eventTitle}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      shift.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      shift.status === 'assigned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {shift.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      {(() => {
                        const formatTime = (timeValue: any) => {
                          if (!timeValue) return '--';
                          if (timeValue instanceof Date) {
                            return timeValue.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          }
                          if (typeof timeValue === 'string') {
                            // Handle string time formats like "14:30" or "2:30 PM"
                            if (timeValue.includes(':')) {
                              return timeValue;
                            }
                            // Try to parse as date string
                            const date = new Date(timeValue);
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                            }
                          }
                          if (timeValue?.toDate) {
                            // Handle Firestore Timestamp
                            return timeValue.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                          }
                          return '--';
                        };
                        
                        return formatTimeRange(shift.startTime, shift.endTime);
                      })()}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      {shift.location}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p className="font-medium mb-1">Duty:</p>
                      <p>{shift.duty}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Check In
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      Request Change
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Notifications
              </h3>
              <Link
                href="/dashboard/volunteer/notifications"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-400 transition-colors flex items-center"
              >
                View all notifications
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{notification.time}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ml-4 ${
                        notification.type === 'reminder' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 