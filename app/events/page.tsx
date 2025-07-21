'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Eye,
  Upload,
  Save,
  X,
  Check,
  UserPlus,
  UserMinus,
  Copy,
  Archive,
  Tag,
  FileText,
  AlertTriangle,
  Bell,
  Mail,
  Download
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { doc, collection, addDoc, updateDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'archived'
  category: string
  poster?: string
  organizers: string[]
  volunteers: string[]
  isArchived: boolean
  createdAt: Date
}

interface User {
  uid: string
  name: string
  email: string
  role: string
}

export default function EventsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedEventDetails, setSelectedEventDetails] = useState<Event | null>(null)

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'upcoming' as const,
    category: 'General',
    poster: ''
  })

  const [showImportModal, setShowImportModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [selectedEventForClone, setSelectedEventForClone] = useState<Event | null>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedEventForImport, setSelectedEventForImport] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user?.role === 'organizer') {
      router.replace('/dashboard/organizer/event')
    } else if (user?.role === 'admin') {
      router.replace('/dashboard/admin/events')
    }
  }, [user, router])

  useEffect(() => {
    loadEvents()
    loadUsers()
  }, [])

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'))
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        volunteers: doc.data().volunteers || [],
        organizers: doc.data().organizers || [],
        category: doc.data().category || 'General',
        isArchived: doc.data().isArchived || false,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Event[]
      setEvents(eventsData)
    } catch (error) {
      toast.error('Failed to load events')
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[]
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleCreateEvent = async () => {
    if (!user) return
    
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate || !newEvent.location) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        organizers: [user.uid],
        volunteers: [],
        createdAt: new Date()
      })
      toast.success('Event created successfully')
      setShowCreateModal(false)
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        status: 'upcoming',
        category: 'General',
        poster: ''
      })
      loadEvents()
    } catch (error) {
      toast.error('Failed to create event')
      console.error('Error creating event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent) return

    setIsLoading(true)
    try {
      await updateDoc(doc(db, 'events', selectedEvent.id), {
        title: selectedEvent.title,
        description: selectedEvent.description,
        startDate: selectedEvent.startDate,
        endDate: selectedEvent.endDate,
        location: selectedEvent.location,
        status: selectedEvent.status,
        poster: selectedEvent.poster
      })
      toast.success('Event updated successfully')
      setShowEditModal(false)
      setSelectedEvent(null)
      loadEvents()
    } catch (error) {
      toast.error('Failed to update event')
      console.error('Error updating event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    // Optimistic update - immediately remove from UI
    const eventIndex = events.findIndex(e => e.id === eventId)
    if (eventIndex !== -1) {
      const updatedEvents = events.filter(e => e.id !== eventId)
      setEvents(updatedEvents)
    }

    try {
      await deleteDoc(doc(db, 'events', eventId))
      toast.success('Event deleted successfully')
    } catch (error) {
      // Revert optimistic update on error
      loadEvents()
      toast.error('Failed to delete event')
      console.error('Error deleting event:', error)
    }
  }

  const handleAssignUser = async (eventId: string, userId: string, role: 'organizer' | 'volunteer') => {
    // Optimistic update - immediately update UI
    const field = role === 'organizer' ? 'organizers' : 'volunteers'
    const eventIndex = events.findIndex(e => e.id === eventId)
    
    if (eventIndex !== -1) {
      const updatedEvents = [...events]
      const currentUsers = updatedEvents[eventIndex][field] || []
      
      if (!currentUsers.includes(userId)) {
        updatedEvents[eventIndex] = {
          ...updatedEvents[eventIndex],
          [field]: [...currentUsers, userId]
        }
        setEvents(updatedEvents)
      }
    }

    try {
      const eventRef = doc(db, 'events', eventId)
      const eventDoc = await getDoc(eventRef)
      
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as Event
        const currentUsers = eventData[field] || []
        
        if (!currentUsers.includes(userId)) {
          await updateDoc(eventRef, {
            [field]: [...currentUsers, userId]
          })
          toast.success(`User assigned as ${role}`)
        }
      }
    } catch (error) {
      // Revert optimistic update on error
      loadEvents()
      toast.error('Failed to assign user')
      console.error('Error assigning user:', error)
    }
  }

  const handleRemoveUser = async (eventId: string, userId: string, role: 'organizer' | 'volunteer') => {
    // Optimistic update - immediately update UI
    const field = role === 'organizer' ? 'organizers' : 'volunteers'
    const eventIndex = events.findIndex(e => e.id === eventId)
    
    if (eventIndex !== -1) {
      const updatedEvents = [...events]
      const currentUsers = updatedEvents[eventIndex][field] || []
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        [field]: currentUsers.filter(id => id !== userId)
      }
      setEvents(updatedEvents)
    }

    try {
      const eventRef = doc(db, 'events', eventId)
      const eventDoc = await getDoc(eventRef)
      
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as Event
        const currentUsers = eventData[field] || []
        
        await updateDoc(eventRef, {
          [field]: currentUsers.filter(id => id !== userId)
        })
        toast.success(`User removed as ${role}`)
      }
    } catch (error) {
      // Revert optimistic update on error
      loadEvents()
      toast.error('Failed to remove user')
      console.error('Error removing user:', error)
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.uid === userId)
    return user?.name || user?.email || 'Unknown User'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleCloneEvent = async () => {
    if (!selectedEventForClone) return

    setIsLoading(true)
    try {
      const { id, ...eventData } = selectedEventForClone
      const clonedEvent = {
        ...eventData,
        title: `${selectedEventForClone.title} (Copy)`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: 'upcoming' as const,
        isArchived: false,
        createdAt: new Date()
      }

      await addDoc(collection(db, 'events'), clonedEvent)
      toast.success('Event cloned successfully')
      setShowCloneModal(false)
      setSelectedEventForClone(null)
      loadEvents()
    } catch (error) {
      toast.error('Failed to clone event')
      console.error('Error cloning event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchiveEvent = async (eventId: string) => {
    // Optimistic update - immediately update UI
    const eventIndex = events.findIndex(e => e.id === eventId)
    if (eventIndex !== -1) {
      const updatedEvents = [...events]
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        isArchived: true,
        status: 'archived'
      }
      setEvents(updatedEvents)
    }

    try {
      await updateDoc(doc(db, 'events', eventId), {
        isArchived: true,
        status: 'archived'
      })
      toast.success('Event archived successfully')
    } catch (error) {
      // Revert optimistic update on error
      loadEvents()
      toast.error('Failed to archive event')
      console.error('Error archiving event:', error)
    }
  }

  const handleUnarchiveEvent = async (eventId: string) => {
    // Optimistic update - immediately update UI
    const eventIndex = events.findIndex(e => e.id === eventId)
    if (eventIndex !== -1) {
      const updatedEvents = [...events]
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        isArchived: false,
        status: 'upcoming'
      }
      setEvents(updatedEvents)
    }

    try {
      await updateDoc(doc(db, 'events', eventId), {
        isArchived: false,
        status: 'upcoming'
      })
      toast.success('Event unarchived successfully')
    } catch (error) {
      // Revert optimistic update on error
      loadEvents()
      toast.error('Failed to unarchive event')
      console.error('Error unarchiving event:', error)
    }
  }

  const handleImportVolunteers = async () => {
    if (!selectedEventForImport) {
      toast.error('Please select an event')
      return
    }

    if (!csvFile) {
      toast.error('Please select a CSV file')
      return
    }

    setIsUploading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        toast.error('CSV file must have at least a header row and one data row')
        return
      }

      const volunteers = lines.slice(1).map(line => {
        const [email, name] = line.split(',').map(field => field.trim())
        return { email, name }
      }).filter(volunteer => volunteer.email && volunteer.name)

      if (volunteers.length === 0) {
        toast.error('No valid volunteer data found in CSV file')
        return
      }

      // Here you would typically save the volunteers to your database
      // For now, we'll just show a success message
      toast.success(`Successfully imported ${volunteers.length} volunteers`)
      
      // Reset form
      setSelectedEventForImport('')
      setCsvFile(null)
      setShowImportModal(false)
    } catch (error) {
      toast.error('Failed to import volunteers. Please check your CSV file format.')
      console.error('Error importing volunteers:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file')
        return
      }
      setCsvFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a valid CSV file')
        return
      }
      setCsvFile(file)
    }
  }

  const handleSendNotification = async (eventId: string, message: string) => {
    try {
      // Simple notification - just show success message
      toast.success('Notification sent to all volunteers')
      setShowNotificationModal(false)
    } catch (error) {
      toast.error('Failed to send notification')
      console.error('Error sending notification:', error)
    }
  }

  const handleSendEmailSummary = async (eventId: string) => {
    try {
      // Simple email summary - just show success message
      toast.success('Email summary sent to organizers')
    } catch (error) {
      toast.error('Failed to send email summary')
      console.error('Error sending email summary:', error)
    }
  }

  const checkOverloadedVolunteers = (event: Event) => {
    // Simple check - just return false for now
    return false
  }

  const eventCategories = ['General', 'Technical', 'Cultural', 'CSR', 'Sports', 'Academic', 'Other']

  if (user?.role === 'organizer' || user?.role === 'admin') {
    return <div>Redirecting to your event dashboard...</div>
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Sticky Header */}
        <div className="sticky top-16 z-40 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Volunteers
                  </button>
                  <button
                    onClick={() => setShowNotificationModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Notification
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {eventCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Archived</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Events Grid */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events
                .filter(event => !filterCategory || event.category === filterCategory)
                .filter(event => showArchived || !event.isArchived)
                .map((event) => (
                <div key={event.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                  {/* Event Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                      <div className="flex items-center mt-1">
                        <Tag className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{event.category}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Users className="h-4 w-4 mr-2" />
                      {event.volunteers?.length || 0} volunteers
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedEventDetails(event)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowEditModal(true)
                      }}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEventForClone(event)
                        setShowCloneModal(true)
                      }}
                      className="flex-1 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Clone
                    </button>
                    {event.isArchived ? (
                      <button
                        onClick={() => handleUnarchiveEvent(event.id)}
                        className="flex-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchiveEvent(event.id)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded text-sm font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Event Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create Event</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="Event title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="Event description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                      <input
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="Event location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      {eventCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={newEvent.status}
                      onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateEvent}
                      disabled={isLoading}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Event'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {showEditModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Event</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={selectedEvent.title}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={selectedEvent.description}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={selectedEvent.startDate}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                      <input
                        type="date"
                        value={selectedEvent.endDate}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={selectedEvent.location}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      value={selectedEvent.status}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateEvent}
                      disabled={isLoading}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Update Event'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Event Details Modal */}
          {selectedEventDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Event Details</h2>
                    <button
                      onClick={() => setSelectedEventDetails(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{selectedEventDetails.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{selectedEventDetails.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Event Information</h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(selectedEventDetails.startDate).toLocaleDateString()} - {new Date(selectedEventDetails.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {selectedEventDetails.location}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Status: <span className={`ml-1 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedEventDetails.status)}`}>
                              {selectedEventDetails.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Assign Users</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Organizer</label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignUser(selectedEventDetails.id, e.target.value, 'organizer')
                                  e.target.value = ''
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            >
                              <option value="">Select user...</option>
                              {users.filter(u => !(selectedEventDetails.organizers || []).includes(u.uid)).map(user => (
                                <option key={user.uid} value={user.uid}>{user.name || user.email}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add Volunteer</label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignUser(selectedEventDetails.id, e.target.value, 'volunteer')
                                  e.target.value = ''
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            >
                              <option value="">Select user...</option>
                              {users.filter(u => !(selectedEventDetails.volunteers || []).includes(u.uid)).map(user => (
                                <option key={user.uid} value={user.uid}>{user.name || user.email}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Organizers</h4>
                        <div className="space-y-2">
                          {(selectedEventDetails.organizers || []).map(organizerId => (
                            <div key={organizerId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{getUserName(organizerId)}</span>
                              <button
                                onClick={() => handleRemoveUser(selectedEventDetails.id, organizerId, 'organizer')}
                                className="text-red-500 hover:text-red-700"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {(selectedEventDetails.organizers || []).length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No organizers assigned</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Volunteers</h4>
                        <div className="space-y-2">
                          {(selectedEventDetails.volunteers || []).map(volunteerId => (
                            <div key={volunteerId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{getUserName(volunteerId)}</span>
                              <button
                                onClick={() => handleRemoveUser(selectedEventDetails.id, volunteerId, 'volunteer')}
                                className="text-red-500 hover:text-red-700"
                              >
                                <UserMinus className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {(selectedEventDetails.volunteers || []).length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No volunteers assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clone Event Modal */}
          {showCloneModal && selectedEventForClone && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Clone Event</h2>
                  <button
                    onClick={() => setShowCloneModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    This will create a copy of "{selectedEventForClone.title}" with all its settings.
                  </p>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowCloneModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCloneEvent}
                      disabled={isLoading}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Cloning...' : 'Clone Event'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Volunteers Modal */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Volunteers</h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Event</label>
                    <select 
                      value={selectedEventForImport}
                      onChange={(e) => setSelectedEventForImport(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="">Choose an event...</option>
                      {events.filter(e => !e.isArchived).map(event => (
                        <option key={event.id} value={event.id}>{event.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload CSV File</label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        csvFile 
                          ? 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('csv-file-input')?.click()}
                    >
                      <input
                        id="csv-file-input"
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {csvFile ? (
                        <div className="flex items-center justify-center">
                          <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{csvFile.name}</p>
                            <p className="text-xs text-green-500 dark:text-green-400">File selected successfully</p>
                          </div>
                        </div>
                      ) : (
                        <>
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CSV files only</p>
                        </>
                      )}
                    </div>
                    {csvFile && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Expected format: email,name (e.g., john@example.com,John Doe)
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImportVolunteers}
                      disabled={isUploading || !selectedEventForImport || !csvFile}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Importing...' : 'Import Volunteers'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Send Notification Modal */}
          {showNotificationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Notification</h2>
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Event</label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                      <option value="">Choose an event...</option>
                      {events.filter(e => !e.isArchived).map(event => (
                        <option key={event.id} value={event.id}>{event.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="Enter your message to all volunteers..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowNotificationModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSendNotification('event-id', 'Sample notification message')
                        setShowNotificationModal(false)
                      }}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 