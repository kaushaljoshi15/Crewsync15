"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from '@/components/AuthProvider';
import { Dialog } from '@headlessui/react';
import { Calendar, MapPin, Users, Clock, Edit3, Plus, AlertTriangle, Pencil, Trash2, UserPlus } from 'lucide-react';

// Add ShiftDoc type
interface ShiftDoc {
  eventId: string;
  role?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  currentVolunteers?: number;
  maxVolunteers?: number;
  status?: string;
}

type Volunteer = {
  id: string;
  shiftId: string;
  userId: string;
  // ...other fields as needed
};

export default function OrganizerShiftsPage() {
  const { user } = useAuth();
  const [eventFilter, setEventFilter] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editShift, setEditShift] = useState<any>(null);
  const [form, setForm] = useState({
    eventId: "",
    role: "",
    startTime: "",
    endTime: "",
    location: "",
    maxVolunteers: 1,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignShift, setAssignShift] = useState<any>(null);
  const [eventVolunteers, setEventVolunteers] = useState<any[]>([]);
  const [assignedVolunteers, setAssignedVolunteers] = useState<string[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch events for this organizer
    // TODO: Fetch events from your own database
    // TODO: Fetch shifts from your own database
    setEvents([]);
    setShifts([]);
    setLoading(false);
  }, [user]);

  const openCreateModal = () => {
    setForm({ eventId: events[0]?.id || "", role: "", startTime: "", endTime: "", location: "", maxVolunteers: 1 });
    setEditShift(null);
    setShowModal(true);
  };
  const openEditModal = (shift: any) => {
    setForm({
      eventId: shift.eventId,
      role: shift.role,
      startTime: shift.startTime || "",
      endTime: shift.endTime || "",
      location: shift.location,
      maxVolunteers: shift.maxVolunteers || 1,
    });
    setEditShift(shift);
    setShowModal(true);
  };
  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "maxVolunteers" ? Number(value) : value }));
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoadingAction(true);
    // TODO: Save or update shift in your own database
    setShowModal(false);
    setLoadingAction(false);
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingAction(true);
    // TODO: Delete shift from your own database
    setShowDeleteModal(false);
    setDeleteId(null);
    setLoadingAction(false);
  };

  const openAssignModal = async (shift: any) => {
    setAssignShift(shift);
    // TODO: Fetch volunteers assigned to the event from your own database
    const volunteers: Volunteer[] = [];
    setEventVolunteers(volunteers);
    
    // TODO: Get volunteers already assigned to this specific shift from your own database
    const shiftAssignedVolunteers: string[] = [];
    setAssignedVolunteers(shiftAssignedVolunteers);
    
    // TODO: Get volunteers assigned to the event but not to this shift from your own database
    const availableVolunteers: Volunteer[] = [];
    
    // TODO: Fetch user info from your own database
    const usersMap: Record<string, any> = {};
    
    // Set available volunteers (those assigned to event but not to any shift)
    setAllVolunteers(availableVolunteers.map(v => ({ ...v, ...usersMap[v.userId] })));
    setShowAssignModal(true);
  };
  const handleToggleVolunteer = async (userId: string) => {
    if (!assignShift) return;
    const alreadyAssigned = assignedVolunteers.includes(userId);
    
    if (alreadyAssigned) {
      // Unassign: update volunteer doc to remove shiftId
      const vDoc = eventVolunteers.find(v => v.userId === userId && v.shiftId === assignShift.id);
      if (vDoc) {
        // TODO: Unassign volunteer from shift in your own database
        setAssignedVolunteers(assignedVolunteers.filter(id => id !== userId));
        
        // Add back to available volunteers list
        setAllVolunteers(prev => [...prev, vDoc]);
      }
    } else {
      // Check if volunteer is already assigned to another shift
      const vDoc = eventVolunteers.find(v => v.userId === userId);
      if (vDoc && vDoc.shiftId && vDoc.shiftId !== "") {
        alert("This volunteer is already assigned to another shift.");
        return;
      }
      
      // Assign: update volunteer doc to set shiftId
      if (vDoc) {
        // TODO: Assign volunteer to shift in your own database
        setAssignedVolunteers([...assignedVolunteers, userId]);
        
        // Remove from available volunteers list
        setAllVolunteers(prev => prev.filter(v => v.userId !== userId));
      }
    }
  };

  const filteredShifts = eventFilter ? shifts.filter(s => s.eventId === eventFilter) : shifts;

  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-200">Shifts</h1>
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 hover:from-indigo-600 hover:to-blue-500 text-white font-bold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            onClick={openCreateModal}
          >
            <Plus className="h-5 w-5" />
            Create New Shift
          </button>
        </div>
        <div className="mb-6 flex gap-4 items-center">
          <label className="font-medium">Filter by Event:</label>
          <select
            className="input"
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
          >
            <option value="">All Events</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          {loading ? (
            <div>Loading shifts...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Time</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Assigned</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShifts.map(shift => (
                  <tr key={shift.id} className="border-t">
                    <td className="py-2">{shift.time || `${shift.startTime || ""} - ${shift.endTime || ""}`}</td>
                    <td className="py-2">{shift.role}</td>
                    <td className="py-2">{shift.location}</td>
                    <td className="py-2">{shift.currentVolunteers || 0} / {shift.maxVolunteers || 0}</td>
                    <td className="py-2">{shift.status}</td>
                    <td className="py-2 flex gap-2">
                      <button
                        className="group p-2 rounded-full transition bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="Edit"
                        onClick={() => openEditModal(shift)}
                      >
                        <Pencil className="h-6 w-6 text-blue-500 group-hover:text-blue-700 transition" />
                      </button>
                      <button
                        className="group p-2 rounded-full transition bg-transparent hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Delete"
                        onClick={() => { setDeleteId(shift.id); setShowDeleteModal(true); }}
                      >
                        <Trash2 className="h-6 w-6 text-red-600 group-hover:text-red-800 transition" />
                      </button>
                      <button
                        className="group p-2 rounded-full transition bg-transparent hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                        title="Assign Volunteer"
                        onClick={() => openAssignModal(shift)}
                      >
                        <UserPlus className="h-6 w-6 text-green-600 group-hover:text-green-800 transition" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto z-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Edit3 className="h-7 w-7 text-blue-600" />
              <Dialog.Title className="text-2xl font-extrabold text-blue-900 dark:text-blue-200">{editShift ? "Edit Shift" : "Create New Shift"}</Dialog.Title>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" /> Event</label>
                <select name="eventId" value={form.eventId} onChange={handleFormChange} className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /> Role</label>
                <input name="role" value={form.role} onChange={handleFormChange} className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required />
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <label className="block font-semibold mb-2 flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" /> Start Time</label>
                  <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleFormChange} className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block font-semibold mb-2 flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" /> End Time</label>
                  <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleFormChange} className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-500" /> Location</label>
                <input name="location" value={form.location} onChange={handleFormChange} className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required />
              </div>
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><Users className="h-5 w-5 text-blue-500" /> Max Volunteers</label>
                <input type="number" name="maxVolunteers" value={form.maxVolunteers} onChange={handleFormChange} className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" min={1} required />
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <button type="button" className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-6 py-2 rounded-full font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg transition" disabled={loadingAction}>{loadingAction ? 'Saving...' : (editShift ? 'Save Changes' : 'Create Shift')}</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto z-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
              <Dialog.Title className="text-2xl font-extrabold text-red-700">Delete Shift?</Dialog.Title>
            </div>
            <p className="mb-8 text-gray-700 dark:text-gray-300">Are you sure you want to delete this shift? This action cannot be undone.</p>
            <div className="flex gap-4 justify-end">
              <button className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger px-6 py-2 rounded-full font-bold bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white shadow-lg transition" onClick={handleDelete} disabled={loadingAction}>{loadingAction ? 'Deleting...' : 'Delete'}</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto z-10 animate-fade-in">
            <Dialog.Title className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><UserPlus className="h-6 w-6" /> Assign Volunteers</Dialog.Title>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {allVolunteers.length === 0 ? (
                <div className="text-gray-500">
                  {assignedVolunteers.length > 0 
                    ? "All volunteers assigned to this event are already assigned to shifts." 
                    : "No volunteers assigned to this event."}
                </div>
              ) : allVolunteers.map(v => (
                <label key={v.userId} className="flex items-center gap-3 p-2 rounded hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignedVolunteers.includes(v.userId)}
                    onChange={() => handleToggleVolunteer(v.userId)}
                    className="accent-green-600"
                  />
                  <span className="font-medium">{v.name || v.userId}</span>
                  <span className="text-xs text-gray-500">{v.email}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition" onClick={() => setShowAssignModal(false)}>Close</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </ProtectedRoute>
  );
} 