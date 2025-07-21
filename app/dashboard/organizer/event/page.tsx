"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, Timestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Edit, Trash2, Plus, Calendar, MapPin, FileText, Users, Clock, Eye, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from '@headlessui/react';
import { getDocs } from 'firebase/firestore';
import { Listbox } from '@headlessui/react';

const ROLES = ["Registration", "Food", "Crowd Control", "Help Desk"];

export default function OrganizerEventPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    roles: [] as string[],
    maxVolunteers: {} as Record<string, number>,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editEvent, setEditEvent] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(form);
  const [editLoading, setEditLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEvent, setAssignEvent] = useState<any>(null);
  const [eventVolunteers, setEventVolunteers] = useState<string[]>([]);
  const [allVolunteers, setAllVolunteers] = useState<any[]>([]);
  const [maxVolunteers, setMaxVolunteers] = useState(1);

  // Fetch events created by this organizer
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "events"), where("createdBy", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    // Fetch all volunteers for the multi-select
    getDocs(query(collection(db, "users"), where("role", "==", "volunteer"))).then(usersSnap => {
      setAllVolunteers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const handleFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "roles") {
      setForm((prev) => ({
        ...prev,
        roles: checked
          ? [...prev.roles, value]
          : prev.roles.filter((r) => r !== value),
      }));
    } else if (name.startsWith("maxVolunteers-")) {
      const role = name.replace("maxVolunteers-", "");
      setForm((prev) => ({
        ...prev,
        maxVolunteers: { ...prev.maxVolunteers, [role]: Number(value) },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEventVolunteersChange = (selected: string[]) => {
    setEventVolunteers(selected);
    // Optionally, update Firestore here to save event-level volunteers
  };

  const handleCreateEvent = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, "events"), {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      location: form.location,
      roles: form.roles,
      maxVolunteers: form.maxVolunteers,
      createdBy: user.uid,
      status: "active",
      createdAt: Timestamp.now(),
    });
    setForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      roles: [],
      maxVolunteers: {},
    });
    setShowForm(false);
  };

  const handleEdit = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    setEditEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      roles: event.roles || [],
      maxVolunteers: event.maxVolunteers || {},
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (name === "roles") {
      setEditForm((prev: any) => ({
        ...prev,
        roles: checked
          ? [...prev.roles, value]
          : prev.roles.filter((r: string) => r !== value),
      }));
    } else if (name.startsWith("maxVolunteers-")) {
      const role = name.replace("maxVolunteers-", "");
      setEditForm((prev: any) => ({
        ...prev,
        maxVolunteers: { ...prev.maxVolunteers, [role]: Number(value) },
      }));
    } else {
      setEditForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateEvent = async (e: any) => {
    e.preventDefault();
    if (!editEvent) return;
    setEditLoading(true);
    await updateDoc(doc(db, "events", editEvent.id), {
      title: editForm.title,
      description: editForm.description,
      date: editForm.date,
      time: editForm.time,
      location: editForm.location,
      roles: editForm.roles,
      maxVolunteers: editForm.maxVolunteers,
    });
    setShowEditModal(false);
    setEditEvent(null);
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteDoc(doc(db, "events", deleteId));
    setDeleteId(null);
    setConfirmDelete(false);
  };

  const openAssignModal = async (event: any) => {
    setAssignEvent(event);
    // Fetch all volunteers
    const usersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "volunteer")));
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllVolunteers(users);
    // Fetch volunteers already assigned to this event
    const vSnap = await getDocs(query(collection(db, "volunteers"), where("eventId", "==", event.id)));
    setEventVolunteers(vSnap.docs.map(v => v.data().userId));
    setShowAssignModal(true);
  };
  const handleToggleVolunteer = async (userId: string) => {
    if (!assignEvent) return;
    const alreadyAssigned = eventVolunteers.includes(userId);
    if (alreadyAssigned) {
      // Unassign: find and delete volunteer doc for this event/user
      const vSnap = await getDocs(query(collection(db, "volunteers"), where("eventId", "==", assignEvent.id), where("userId", "==", userId)));
      vSnap.forEach(async vDoc => {
        await updateDoc(doc(db, "volunteers", vDoc.id), { eventId: "", shiftId: "" });
      });
      setEventVolunteers(eventVolunteers.filter(id => id !== userId));
    } else {
      // Assign: add volunteer doc for this event/user
      await addDoc(collection(db, "volunteers"), { eventId: assignEvent.id, userId, shiftId: "" });
      setEventVolunteers([...eventVolunteers, userId]);
    }
  };

  const maxReached = eventVolunteers.length >= (assignEvent?.maxVolunteers || 0);

  const handleAssignSelected = async () => {
    if (!assignEvent) return;
    const newEventVolunteers = [...eventVolunteers];
    const assignedCount = newEventVolunteers.length;
    const maxAllowed = assignEvent.maxVolunteers[assignEvent.roles[0]] || 1;

    if (assignedCount >= maxAllowed) {
      alert("Maximum number of volunteers already assigned for this event.");
      return;
    }

    const usersToAssign = allVolunteers.filter(v => newEventVolunteers.includes(v.id));

    for (const user of usersToAssign) {
      await addDoc(collection(db, "volunteers"), {
        eventId: assignEvent.id,
        userId: user.id,
        shiftId: "", // Placeholder, will be updated later
        assignedAt: Timestamp.now(),
      });
    }
    setEventVolunteers(newEventVolunteers);
    setShowAssignModal(false);
    alert(`${usersToAssign.length} volunteers assigned successfully.`);
  };

  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <div className="max-w-4xl mx-auto py-8 px-4 bg-gradient-to-br from-blue-50 to-blue-200 dark:from-slate-900 dark:to-blue-900 min-h-screen rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-200">My Events</h1>
          <button
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            onClick={() => setShowForm((v) => !v)}
          >
            <Plus className="h-5 w-5" />
            {showForm ? "Cancel" : "Create New Event"}
          </button>
        </div>
        {showForm && (
          <form
            className="bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-2xl mb-10 border border-blue-300 dark:border-blue-700 max-w-2xl mx-auto space-y-8 animate-fade-in"
            onSubmit={handleCreateEvent}
          >
            <h2 className="text-3xl font-extrabold mb-2 text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 p-2 rounded-full"><Plus className="h-6 w-6 text-blue-700" /></span>
              Create New Event
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Fill in the details below to create a new event. All fields are required.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" /> Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                  maxLength={100}
                  placeholder="Event Title"
                  aria-label="Event Title"
                />
                <span className="text-xs text-gray-500">Max 100 characters</span>
              </div>
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-500" /> Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                  maxLength={100}
                  placeholder="Event Location"
                  aria-label="Event Location"
                />
                <span className="text-xs text-gray-500">Where will the event take place?</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2 flex items-center gap-2"><FileText className="h-5 w-5 text-blue-500" /> Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                required
                maxLength={500}
                placeholder="Event Description"
                aria-label="Event Description"
              />
              <span className="text-xs text-gray-500">Max 500 characters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" /> Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                  aria-label="Event Date"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 flex items-center gap-2"><Clock className="h-5 w-5 text-blue-500" /> Time</label>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleFormChange}
                  className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                  required
                  aria-label="Event Time"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Max Volunteers</label>
              <input
                type="number"
                min={1}
                value={maxVolunteers}
                onChange={e => setMaxVolunteers(Number(e.target.value))}
                className="input w-full"
                required
              />
            </div>
            <button
              className="btn btn-primary mt-6 w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold shadow-lg transition"
              type="submit"
            >
              <Plus className="inline-block mr-2 h-5 w-5" /> Create Event
            </button>
          </form>
        )}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-blue-200 dark:border-blue-800">
          <h2 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-200">Event List</h2>
          {loading ? (
            <div>Loading events...</div>
          ) : events.length === 0 ? (
            <div>No events found. Create your first event!</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Roles</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t">
                    <td className="py-2 font-medium">{event.title}</td>
                    <td className="py-2">{event.date} {event.time}</td>
                    <td className="py-2">{event.location}</td>
                    <td className="py-2">{Array.isArray(event.roles) ? event.roles.join(", ") : ""}</td>
                    <td className="py-2">{event.status}</td>
                    <td className="py-2 flex gap-3">
                      <button
                        className="group p-2 rounded-full transition bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="View"
                        onClick={() => router.push(`/dashboard/organizer/event/${event.id}`)}
                      >
                        <Eye className="h-6 w-6 text-blue-500 group-hover:text-blue-700 transition" />
                      </button>
                      <button
                        className="group p-2 rounded-full transition bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="Edit"
                        onClick={() => handleEdit(event.id)}
                      >
                        <Edit className="h-6 w-6 text-blue-600 group-hover:text-blue-800 transition" />
                      </button>
                      <button
                        className="group p-2 rounded-full transition bg-transparent hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Delete"
                        onClick={() => { setDeleteId(event.id); setConfirmDelete(true); }}
                      >
                        <Trash2 className="h-6 w-6 text-red-600 group-hover:text-red-800 transition" />
                      </button>
                      <button
                        className="group p-2 rounded-full transition bg-transparent hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                        title="Assign Volunteers"
                        onClick={() => openAssignModal(event)}
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
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/80 to-blue-900/60 backdrop-blur-sm z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-800 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-3">
                <Trash2 className="h-7 w-7 text-red-600" />
                <h3 className="text-xl font-bold text-red-700">Delete Event?</h3>
              </div>
              <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this event? This action cannot be undone.</p>
              <div className="flex gap-4 justify-end">
                <button
                  className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                  onClick={() => { setDeleteId(null); setConfirmDelete(false); }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger px-6 py-2 rounded-full font-bold bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white shadow-lg transition"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Event Modal */}
        <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Overlay replacement */}
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900/80 to-blue-400/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />
            <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-10 w-full max-w-lg mx-auto z-10 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Edit className="h-7 w-7 text-blue-600" />
                <Dialog.Title className="text-2xl font-extrabold text-blue-900 dark:text-blue-200">Edit Event</Dialog.Title>
              </div>
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Title</label>
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditFormChange}
                    className="input w-full"
                    required
                    maxLength={100}
                    placeholder="Event Title"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Location</label>
                  <input
                    name="location"
                    value={editForm.location}
                    onChange={handleEditFormChange}
                    className="input w-full"
                    required
                    maxLength={100}
                    placeholder="Event Location"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    className="input w-full"
                    required
                    maxLength={500}
                    placeholder="Event Description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={editForm.date}
                      onChange={handleEditFormChange}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={editForm.time}
                      onChange={handleEditFormChange}
                      className="input w-full"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1">Max Volunteers</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.maxVolunteers[editForm.roles[0]] || 1} // Assuming one role for simplicity, adjust if multiple roles
                    onChange={e => setEditForm(prev => ({
                      ...prev,
                      maxVolunteers: { ...prev.maxVolunteers, [editForm.roles[0]]: Number(e.target.value) }
                    }))}
                    className="input w-full"
                    required
                  />
                </div>
                <div className="flex gap-4 justify-end mt-6">
                  <button
                    type="button"
                    className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-6 py-2 rounded-full font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg transition"
                    disabled={editLoading}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Assign Volunteers Modal */}
        <Dialog open={showAssignModal} onClose={() => setShowAssignModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto z-10 animate-fade-in">
              <Dialog.Title className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><UserPlus className="h-6 w-6" /> Assign Volunteers</Dialog.Title>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {allVolunteers.length === 0 ? (
                  <div className="text-gray-500">No volunteers found.</div>
                ) : allVolunteers.map(v => (
                  <label key={v.id} className="flex items-center gap-4 p-2 rounded hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventVolunteers.includes(v.id)}
                      onChange={() => handleToggleVolunteer(v.id)}
                      className="accent-green-600 h-5 w-5"
                      disabled={!eventVolunteers.includes(v.id) && maxReached}
                    />
                    <span className="font-medium w-1/3 truncate">{v.name || v.id}</span>
                    <span className="text-xs text-gray-500 w-1/3 truncate">{v.role || 'volunteer'}</span>
                    <span className="text-xs text-gray-500 w-1/3 truncate">{v.status || '-'}</span>
                  </label>
                ))}
              </div>
              {maxReached && (
                <div className="text-xs text-red-500 mt-2">Maximum number of volunteers assigned for this event.</div>
              )}
              <div className="flex gap-4 justify-end mt-6">
                <button className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition" onClick={() => setShowAssignModal(false)}>Close</button>
                {eventVolunteers.length > 0 && (
                  <button className="btn btn-primary px-6 py-2 rounded-full font-bold bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white shadow-lg transition" onClick={handleAssignSelected}>Assign Selected</button>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
} 