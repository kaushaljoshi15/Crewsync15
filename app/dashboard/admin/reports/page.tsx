'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, X } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import toast from 'react-hot-toast'

interface User {
  uid: string
  name: string
  email: string
  role: string
}

export default function AdminReportsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // TODO: Fetch events, shifts, and users from your own database
      setEvents([])
      setShifts([])
      setUsers([])
      setLoading(false)
    }
    fetchData()
  }, [])

  const getUserName = (uid: string) => {
    const user = users.find(u => u.uid === uid)
    return user?.name || user?.email || uid
  }

  // Prepare rows for volunteers and organizers by event
  const volunteerRows = events.flatMap(event =>
    (event.volunteers || []).map((volId: string) => ({
      event: event.title,
      name: getUserName(volId),
      role: 'Volunteer',
      eventId: event.id
    }))
  )
  const organizerRows = events.flatMap(event =>
    (event.organizers || []).map((orgId: string) => ({
      event: event.title,
      name: getUserName(orgId),
      role: 'Organizer',
      eventId: event.id
    }))
  )
  const peopleRows = [...volunteerRows, ...organizerRows]

  // Fetch reports for dashboard update
  const fetchReports = async () => {
    try {
      // TODO: Fetch reports from your own database
      setReports([])
    } catch {}
  }

  const exportCSV = async (data: any[], filename: string, reportType: string) => {
    const csvRows = []
    const headers = Object.keys(data[0] || {})
    csvRows.push(headers.join(','))
    for (const row of data) {
      csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    }
    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
    // TODO: Upload report to your own storage system and save to your database
    try {
      // TODO: Upload blob to your own storage system
      // TODO: Save report metadata to your own database
      toast.success('Report generated and uploaded!')
      await fetchReports()
    } catch (e) {
      toast.error('Failed to generate or upload report!')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <button onClick={() => router.push('/dashboard/admin')} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" title="Close">
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold mb-2">Generate Reports</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Export event and shift data as CSV for analysis or record-keeping.</p>
          <div className="flex gap-4 mb-8">
            <button onClick={() => exportCSV(events, 'events.csv', 'Events')} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors">
              <Download className="h-4 w-4 mr-2" /> Export Events CSV
            </button>
            <button onClick={() => exportCSV(shifts, 'shifts.csv', 'Shifts')} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors">
              <Download className="h-4 w-4 mr-2" /> Export Shifts CSV
            </button>
            <button onClick={() => exportCSV(peopleRows, 'people.csv', 'People')} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors">
              <Download className="h-4 w-4 mr-2" /> Export People CSV
            </button>
          </div>
          <h2 className="text-xl font-semibold mb-2">Volunteers & Organizers by Event</h2>
          <div className="overflow-x-auto mb-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-100 dark:bg-primary-900">
                <tr>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Event</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Name</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Role</th>
                </tr>
              </thead>
              <tbody>
                {peopleRows.map((row, i) => (
                  <tr key={row.eventId + row.name + row.role + i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-100 dark:bg-slate-700'}>
                    <td className="px-2 py-1 border-b">{row.event}</td>
                    <td className="px-2 py-1 border-b">{row.name}</td>
                    <td className="px-2 py-1 border-b">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="text-xl font-semibold mb-2">Events Preview</h2>
          <div className="overflow-x-auto mb-8 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-100 dark:bg-primary-900">
                <tr>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Event Title</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Description</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Location</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Status</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Start Date</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">End Date</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Name</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Role</th>
                </tr>
              </thead>
              <tbody>
                {events.flatMap((e: any, i: number) => {
                  const organizerRows = (Array.isArray(e.organizers) ? e.organizers : []).map((id: string, idx: number) => (
                    <tr key={e.id + '-org-' + id + '-' + idx} className={(i + idx) % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-100 dark:bg-slate-700'}>
                      <td className="px-2 py-1 border-b">{e.title}</td>
                      <td className="px-2 py-1 border-b">{e.description}</td>
                      <td className="px-2 py-1 border-b">{e.location}</td>
                      <td className="px-2 py-1 border-b">{e.status}</td>
                      <td className="px-2 py-1 border-b">{e.startDate}</td>
                      <td className="px-2 py-1 border-b">{e.endDate}</td>
                      <td className="px-2 py-1 border-b">{getUserName(id)}</td>
                      <td className="px-2 py-1 border-b">Organizer</td>
                    </tr>
                  ));
                  const volunteerRows = (Array.isArray(e.volunteers) ? e.volunteers : []).map((id: string, idx: number) => (
                    <tr key={e.id + '-vol-' + id + '-' + idx} className={(i + organizerRows.length + idx) % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-100 dark:bg-slate-700'}>
                      <td className="px-2 py-1 border-b">{e.title}</td>
                      <td className="px-2 py-1 border-b">{e.description}</td>
                      <td className="px-2 py-1 border-b">{e.location}</td>
                      <td className="px-2 py-1 border-b">{e.status}</td>
                      <td className="px-2 py-1 border-b">{e.startDate}</td>
                      <td className="px-2 py-1 border-b">{e.endDate}</td>
                      <td className="px-2 py-1 border-b">{getUserName(id)}</td>
                      <td className="px-2 py-1 border-b">Volunteer</td>
                    </tr>
                  ));
                  return [...organizerRows, ...volunteerRows];
                })}
              </tbody>
            </table>
          </div>
          <h2 className="text-xl font-semibold mb-2">Shifts Preview</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <table className="min-w-full text-sm">
              <thead className="bg-primary-100 dark:bg-primary-900">
                <tr>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Event Title</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Title</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Description</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Location</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Date</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Start Time</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">End Time</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Role</th>
                  <th className="px-2 py-1 font-semibold text-primary-700 dark:text-primary-200 border-b">Volunteer Name</th>
                </tr>
              </thead>
              <tbody>
                {shifts.flatMap((s: any, i: number) => {
                  const volunteerRows = (Array.isArray(s.assignedVolunteers) && s.assignedVolunteers.length > 0)
                    ? s.assignedVolunteers.map((id: string, idx: number) => (
                        <tr key={s.id + '-vol-' + id + '-' + idx} className={(i + idx) % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-100 dark:bg-slate-700'}>
                          <td className="px-2 py-1 border-b">{s.eventTitle}</td>
                          <td className="px-2 py-1 border-b">{s.title}</td>
                          <td className="px-2 py-1 border-b">{s.description}</td>
                          <td className="px-2 py-1 border-b">{s.location}</td>
                          <td className="px-2 py-1 border-b">{s.date}</td>
                          <td className="px-2 py-1 border-b">{s.startTime}</td>
                          <td className="px-2 py-1 border-b">{s.endTime}</td>
                          <td className="px-2 py-1 border-b">{s.role}</td>
                          <td className="px-2 py-1 border-b">{getUserName(id)}</td>
                        </tr>
                      ))
                    : [
                        <tr key={s.id + '-novol'} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-100 dark:bg-slate-700'}>
                          <td className="px-2 py-1 border-b">{s.eventTitle}</td>
                          <td className="px-2 py-1 border-b">{s.title}</td>
                          <td className="px-2 py-1 border-b">{s.description}</td>
                          <td className="px-2 py-1 border-b">{s.location}</td>
                          <td className="px-2 py-1 border-b">{s.date}</td>
                          <td className="px-2 py-1 border-b">{s.startTime}</td>
                          <td className="px-2 py-1 border-b">{s.endTime}</td>
                          <td className="px-2 py-1 border-b">{s.role}</td>
                          <td className="px-2 py-1 border-b"></td>
                        </tr>
                      ];
                  return volunteerRows;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 