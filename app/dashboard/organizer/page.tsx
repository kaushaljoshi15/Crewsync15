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
  Edit,
  Trash2,
  UserPlus,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { formatTimeRange } from '@/lib/utils';

// Mock data for organizer dashboard
const mockEvents = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    date: new Date('2024-03-15'),
    location: 'Convention Center',
    status: 'active',
    totalVolunteers: 25,
    confirmedVolunteers: 20,
    checkedInVolunteers: 15,
    progress: 75,
    roles: ['Registration', 'Crowd Control', 'Help Desk']
  },
  {
    id: '2',
    title: 'Community Festival',
    date: new Date('2024-04-20'),
    location: 'City Park',
    status: 'draft',
    totalVolunteers: 40,
    confirmedVolunteers: 30,
    checkedInVolunteers: 0,
    progress: 60,
    roles: ['Registration', 'Crowd Control', 'Food Service']
  }
]

const mockStats = {
  totalEvents: 12,
  activeEvents: 8,
  totalVolunteers: 156,
  confirmedVolunteers: 142,
  checkedInVolunteers: 98,
  upcomingShifts: 24,
  completionRate: 87,
  satisfactionScore: 4.8,
  efficiencyScore: 92,
  noShows: 8,
  volunteerTurnout: 85
}

export default function OrganizerDashboardPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalVolunteers: 0, totalShifts: 0 });
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();

  const openEditModal = (event: any) => {
    setEditEvent(event);
    setEditForm({ ...event });
    setShowEditModal(true);
  };
  const handleEditFormChange = (e: any) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleUpdateEvent = async (e: any) => {
    e.preventDefault();
    if (!editEvent) return;
    setLoadingAction(true);
    await updateDoc(doc(db, 'events', editEvent.id), editForm);
    setShowEditModal(false);
    setLoadingAction(false);
  };
  const openDeleteModal = (eventId: string) => {
    setDeleteId(eventId);
    setShowDeleteModal(true);
  };
  const handleDeleteEvent = async () => {
    if (!deleteId) return;
    setLoadingAction(true);
    await deleteDoc(doc(db, 'events', deleteId));
    setShowDeleteModal(false);
    setDeleteId(null);
    setLoadingAction(false);
  };

  // Simulate real-time updates
  useEffect(() => {
    if (!user) return;
    // Fetch events for this organizer
    getDocs(query(collection(db, 'events'), where('createdBy', '==', user.uid))).then(eventSnap => {
      const eventList = eventSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setEvents(eventList);
      const eventIds = eventList.map(e => e.id);
      if (eventIds.length === 0) {
        setShifts([]);
        setStats({ totalEvents: 0, totalVolunteers: 0, totalShifts: 0 });
        return;
      }
      // Listen for real-time shifts updates
      const shiftsQuery = query(collection(db, 'shifts'), where('eventId', 'in', eventIds));
      const unsubShifts = onSnapshot(shiftsQuery, shiftSnap => {
        const shiftList = shiftSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setShifts(shiftList);
        // Fetch volunteers for these events
        getDocs(query(collection(db, 'volunteers'), where('eventId', 'in', eventIds))).then(volSnap => {
          setStats({
            totalEvents: eventList.length,
            totalVolunteers: volSnap.docs.length,
            totalShifts: shiftList.length
          });
        });
      });
      return () => unsubShifts();
    });
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
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
                  Organizer Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Welcome back, {user?.email}! Manage your events and volunteers.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-300 text-sm">Live</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {/* Wrap the flex row in a container div with max-w-4xl mx-auto */}
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center gap-12 mb-8">
              <button
                className="flex-1 max-w-md bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 transition-all duration-300 shadow-lg group"
                onClick={() => router.push('/dashboard/organizer/event')}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Create Event</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Launch new event</p>
                  </div>
                </div>
              </button>
              <button
                className="flex-1 max-w-md bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-primary-500/50 transition-all duration-300 shadow-lg group"
                onClick={() => router.push('/dashboard/organizer/shifts')}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Create Shifts</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Schedule time slots</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Volunteers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVolunteers}</p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Shifts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalShifts}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Events */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Crown className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Active Events
              </h3>
              <Link
                href="/events"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-400 transition-colors flex items-center"
              >
                View all events
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event, index) => {
                const progress = event.totalVolunteers > 0 ? Math.round((event.confirmedVolunteers / event.totalVolunteers) * 100) : 0;
                return (
                  <div key={event.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {event.date ? new Date(event.date).toLocaleDateString() : ''} • {event.location}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400" onClick={() => openEditModal(event)}>
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600" onClick={() => openDeleteModal(event.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Volunteer Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300">Total</p>
                        <p className="font-medium text-gray-900 dark:text-white">{event.totalVolunteers}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300">Confirmed</p>
                        <p className="font-medium text-gray-900 dark:text-white">{event.confirmedVolunteers}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300">Checked In</p>
                        <p className="font-medium text-gray-900 dark:text-white">{event.checkedInVolunteers}</p>
                      </div>
                    </div>

                    {/* Roles */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Roles:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.roles.map((role: any, idx: any) => (
                          <span key={idx} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Shifts */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                Recent Shifts
              </h3>
              <Link
                href="/shifts"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-400 transition-colors flex items-center"
              >
                View all shifts
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Volunteers
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {shifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{shift.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatTimeRange(shift.startTime, shift.endTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{shift.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {shift.currentVolunteers}/{shift.maxVolunteers}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            shift.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            shift.status === 'full' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {shift.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="p-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 dark:text-gray-300 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-auto z-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Edit className="h-7 w-7 text-blue-600" />
              <Dialog.Title className="text-2xl font-extrabold text-blue-900 dark:text-blue-200">Edit Event</Dialog.Title>
            </div>
            <form onSubmit={handleUpdateEvent} className="space-y-6">
              <div>
                <label className="block font-semibold mb-2">Title</label>
                <input name="title" value={editForm.title || ''} onChange={handleEditFormChange} className="input w-full" required />
              </div>
              <div>
                <label className="block font-semibold mb-2">Location</label>
                <input name="location" value={editForm.location || ''} onChange={handleEditFormChange} className="input w-full" required />
              </div>
              <div>
                <label className="block font-semibold mb-2">Description</label>
                <textarea name="description" value={editForm.description || ''} onChange={handleEditFormChange} className="input w-full" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">Date</label>
                  <input type="date" name="date" value={editForm.date || ''} onChange={handleEditFormChange} className="input w-full" required />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Time</label>
                  <input type="time" name="time" value={editForm.time || ''} onChange={handleEditFormChange} className="input w-full" required />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2">Max Volunteers</label>
                <input type="number" name="maxVolunteers" value={editForm.maxVolunteers || 1} onChange={handleEditFormChange} className="input w-full" min={1} required />
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <button type="button" className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-6 py-2 rounded-full font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg transition" disabled={loadingAction}>{loadingAction ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto z-10 animate-fade-in">
            <Dialog.Title className="text-xl font-bold mb-4 text-red-700">Delete Event?</Dialog.Title>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end mt-6">
              <button className="px-6 py-2 rounded-full font-bold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600 shadow transition" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="px-6 py-2 rounded-full font-bold bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white shadow-lg transition" onClick={handleDeleteEvent} disabled={loadingAction}>{loadingAction ? 'Deleting...' : 'Delete'}</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </ProtectedRoute>
  )
} 