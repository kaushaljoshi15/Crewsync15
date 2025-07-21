'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ProtectedRoute from '@/components/ProtectedRoute'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

export default function AdminNotificationsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [target, setTarget] = useState('all')
  const [eventId, setEventId] = useState('')
  const [shiftId, setShiftId] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const eventsSnap = await getDocs(collection(db, 'events'))
      const shiftsSnap = await getDocs(collection(db, 'shifts'))
      setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setShifts(shiftsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }
    fetchData()
  }, [])

  const handleSend = () => {
    if (!message.trim()) {
      toast.error('Message cannot be empty')
      return
    }
    let targetDesc = 'all users'
    if (target === 'event') targetDesc = `event: ${eventId}`
    if (target === 'shift') targetDesc = `shift: ${shiftId}`
    toast.success(`Notification sent to ${targetDesc}`)
    setMessage('')
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <button onClick={() => router.push('/dashboard/admin')} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" title="Close">
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold mb-2">Send Notifications</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Send a message to all users, or target by event or shift.</p>
          <div className="mb-4">
            <label className="block font-medium mb-1">Target</label>
            <select value={target} onChange={e => setTarget(e.target.value)} className="w-full border rounded-lg px-2 py-2 bg-primary-50 dark:bg-primary-900 text-primary-800 dark:text-primary-200 focus:ring-2 focus:ring-primary-400">
              <option value="all">All Users</option>
              <option value="event">By Event</option>
              <option value="shift">By Shift</option>
            </select>
          </div>
          {target === 'event' && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Event</label>
              <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full border rounded-lg px-2 py-2 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 focus:ring-2 focus:ring-blue-400">
                <option value="">Select event...</option>
                {events.map((e: any) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          )}
          {target === 'shift' && (
            <div className="mb-4">
              <label className="block font-medium mb-1">Shift</label>
              <select value={shiftId} onChange={e => setShiftId(e.target.value)} className="w-full border rounded-lg px-2 py-2 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 focus:ring-2 focus:ring-green-400">
                <option value="">Select shift...</option>
                {shifts.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          )}
          <div className="mb-4">
            <label className="block font-medium mb-1">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full border rounded-lg px-2 py-2 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-400" placeholder="Enter your message..." />
          </div>
          <button onClick={handleSend} className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors">Send Notification</button>
        </div>
      </div>
    </ProtectedRoute>
  )
} 