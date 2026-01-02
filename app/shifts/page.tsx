'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Users, 
  UserPlus,
  UserMinus,
  Eye,
  Save,
  X,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation';

interface Shift {
  id: string
  eventId: string
  eventTitle: string
  title: string
  description: string
  startTime: string
  endTime: string
  date: string
  location: string
  maxVolunteers: number
  assignedVolunteers: string[]
  role: string
  status: 'open' | 'full' | 'completed'
  createdAt: Date
}

interface Event {
  id: string
  title: string
  location: string
  volunteers: string[]
  organizers: string[]
}

interface User {
  uid: string
  name: string
  email: string
  role: string
}

export default function ShiftsPage() {
  const { user } = useAuth()
  const router = useRouter();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'organizer') {
      router.replace('/dashboard/organizer/shifts');
      return;
    }
    if (user.role === 'volunteer') {
      // TODO: Fetch shifts assigned to this volunteer from your own database
      // TODO: Set up real-time listener with your own database
      setShifts([]);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, router]);

  if (!user) {
    return <div className="text-center py-10 text-gray-500">Please sign in to view your shifts.</div>;
  }
  if (user.role === 'organizer') {
    return <div>Redirecting to your shifts dashboard...</div>;
  }
  if (user.role !== 'volunteer') {
    return <div>Shifts page is only available for volunteers and organizers.</div>;
  }

  return (
    <ProtectedRoute allowedRoles={['volunteer']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 py-10 px-4 relative">
        <button
          onClick={() => router.push('/dashboard/volunteer')}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 z-20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-primary-700 dark:text-primary-300">My Shifts</h1>
          {isLoading ? (
            <div className="text-center text-gray-500">Loading your shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="text-center text-gray-500">You have no assigned shifts yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shifts.map(shift => (
                <div key={shift.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-300 mb-1">{shift.title}</h2>
                    <div className="text-gray-600 dark:text-gray-300 mb-1">{shift.eventTitle}</div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {shift.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {shift.startTime} - {shift.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <Users className="h-4 w-4 mr-1" />
                      {shift.location}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span className="font-medium">Role:</span> {shift.role}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span className="font-medium">Status:</span> {shift.status}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Description:</span> {shift.description}
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
                    >
                      Check In
                    </button>
                    <button
                      className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Request Change
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 