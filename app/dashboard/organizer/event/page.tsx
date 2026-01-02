"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Edit, Trash2, Plus, Calendar, MapPin, FileText, Users, Clock, Eye, UserPlus, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from '@headlessui/react';
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

  // Fetch events created by this organizer - implement with your own database
  useEffect(() => {
    if (!user) return;
    // TODO: Fetch events from your own database
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // TODO: Fetch all volunteers from your own database
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
    // TODO: Update your own database to save event-level volunteers
  };

  const handleCreateEvent = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    // TODO: Save event to your own database
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
    // TODO: Update event in your own database
    setShowEditModal(false);
    setEditEvent(null);
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    // TODO: Delete event from your own database
    setDeleteId(null);
    setConfirmDelete(false);
  };

  const openAssignModal = async (event: any) => {
    setAssignEvent(event);
    // TODO: Fetch all volunteers from your own database
    // TODO: Fetch volunteers already assigned to this event from your own database
    setShowAssignModal(true);
  };

  const handleToggleVolunteer = async (userId: string) => {
    if (!assignEvent) return;
    
    // TODO: Check if volunteer is already assigned to this event in your own database
    // TODO: Assign volunteer to event in your own database
    setEventVolunteers([...eventVolunteers, userId]);
    
    // Remove from available volunteers list
    setAllVolunteers(prev => prev.filter(v => v.id !== userId));
  };

  const maxReached = eventVolunteers.length >= (assignEvent?.maxVolunteers || 0);

  const handleAssignSelected = async () => {
    if (!assignEvent) return;
    
    // Close the modal after assignments are handled
    setShowAssignModal(false);
    alert("Volunteers assigned successfully.");
  };

  const handleRemoveDuplicateAssignments = async () => {
    if (!assignEvent) return;
    
    try {
      // TODO: Fetch all volunteer assignments for this event from your own database
      // TODO: Remove duplicates in your own database
      alert("No duplicate assignments found.");
    } catch (error) {
      console.error('Error removing duplicates:', error);
      alert('Failed to remove duplicate assignments.');
    }
  };

  const handleCleanupAllDuplicates = async () => {
    if (!user) return;
    
    try {
      // TODO: Fetch all events for this organizer from your own database
      // TODO: Remove duplicates across all events in your own database
      alert("No duplicate assignments found across all events.");
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      alert('Failed to clean up duplicate assignments.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-blue-200 dark:from-slate-900 dark:to-blue-900">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-900 dark:text-blue-200">
              My Events
            </h1>
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-semibold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm sm:text-base"
                onClick={handleCleanupAllDuplicates}
                title="Remove duplicate volunteer assignments across all events"
              >
                Cleanup Duplicates
              </button>
              <button
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-sm sm:text-base w-full sm:w-auto justify-center"
                onClick={() => setShowForm((v) => !v)}
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                {showForm ? "Cancel" : "Create New Event"}
              </button>
            </div>
          </div>

          {/* Create Event Form */}
          {showForm && (
            <div className="mb-8 sm:mb-10">
              <form
                className="bg-white dark:bg-slate-800 p-4 sm:p-6 lg:p-10 rounded-2xl shadow-2xl border border-blue-300 dark:border-blue-700 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in"
                onSubmit={handleCreateEvent}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
                    </span>
                    Create New Event
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors sm:hidden"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                  Fill in the details below to create a new event. All fields are required.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div>
                    <label className="block font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /> 
                      Title
                    </label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-sm sm:text-base"
                      required
                      maxLength={100}
                      placeholder="Event Title"
                      aria-label="Event Title"
                    />
                    <span className="text-xs text-gray-500">Max 100 characters</span>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /> 
                      Location
                    </label>
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleFormChange}
                      className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-sm sm:text-base"
                      required
                      maxLength={100}
                      placeholder="Event Location"
                      aria-label="Event Location"
                    />
                    <span className="text-xs text-gray-500">Where will the event take place?</span>
                  </div>
                </div>
                
                <div>
                  <label className="block font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /> 
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-sm sm:text-base"
                    required
                    maxLength={500}
                    placeholder="Event Description"
                    aria-label="Event Description"
                    rows={4}
                  />
                  <span className="text-xs text-gray-500">Max 500 characters</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  <div>
                    <label className="block font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /> 
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                      className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-sm sm:text-base"
                      required
                      aria-label="Event Date"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" /> 
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleFormChange}
                      className="input w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-sm sm:text-base"
                      required
                      aria-label="Event Time"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block font-medium mb-2 text-sm sm:text-base">Max Volunteers</label>
                  <input
                    type="number"
                    min={1}
                    value={maxVolunteers}
                    onChange={e => setMaxVolunteers(Number(e.target.value))}
                    className="input w-full text-sm sm:text-base"
                    required
                  />
                </div>
                
                <button
                  className="btn btn-primary mt-6 w-full py-3 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg transition rounded-lg"
                  type="submit"
                >
                  <Plus className="inline-block mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                  Create Event
                </button>
              </form>
            </div>
          )}

          {/* Events List Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-blue-800 dark:text-blue-200">
              Event List
            </h2>
            
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm sm:text-base">
                No events found. Create your first event!
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Roles</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Volunteers</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id} className="border-t border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{event.title}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{event.date} {event.time}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{event.location}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {Array.isArray(event.roles) ? event.roles.join(", ") : ""}
                          </td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{event.status}</td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                            {(() => {
                              // Count volunteers for this event
                              const eventVolunteerCount = eventVolunteers.filter(id => 
                                events.find(e => e.id === event.id)?.volunteers?.includes(id)
                              ).length;
                              return eventVolunteerCount > 0 ? eventVolunteerCount : "0";
                            })()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                className="group p-2 rounded-full transition bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                title="View"
                                onClick={() => router.push(`/dashboard/organizer/event/${event.id}`)}
                              >
                                <Eye className="h-5 w-5 text-blue-500 group-hover:text-blue-700 transition" />
                              </button>
                              <button
                                className="group p-2 rounded-full transition bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                title="Edit"
                                onClick={() => handleEdit(event.id)}
                              >
                                <Edit className="h-5 w-5 text-blue-600 group-hover:text-blue-800 transition" />
                              </button>
                              <button
                                className="group p-2 rounded-full transition bg-transparent hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                                title="Delete"
                                onClick={() => { setDeleteId(event.id); setConfirmDelete(true); }}
                              >
                                <Trash2 className="h-5 w-5 text-red-600 group-hover:text-red-800 transition" />
                              </button>
                              <button
                                className="group p-2 rounded-full transition bg-transparent hover:bg-green-100 dark:hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                                title="Assign Volunteers"
                                onClick={() => openAssignModal(event)}
                              >
                                <UserPlus className="h-5 w-5 text-green-600 group-hover:text-green-800 transition" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{event.title}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {event.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date} {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>{Array.isArray(event.roles) ? event.roles.join(", ") : ""}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <button
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition text-xs font-medium"
                          onClick={() => router.push(`/dashboard/organizer/event/${event.id}`)}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition text-xs font-medium"
                          onClick={() => handleEdit(event.id)}
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition text-xs font-medium"
                          onClick={() => { setDeleteId(event.id); setConfirmDelete(true); }}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                        <button
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition text-xs font-medium"
                          onClick={() => openAssignModal(event)}
                        >
                          <UserPlus className="h-3 w-3" />
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {confirmDelete && (
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/80 to-blue-900/60 backdrop-blur-sm z-50 animate-fade-in p-4">
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-800 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="h-6 w-6 sm:h-7 sm:w-7 text-red-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-red-700">Delete Event?</h3>
                </div>
                <p className="mb-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  Are you sure you want to delete this event? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                  <button
                    className="btn btn-secondary px-4 sm:px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => { setDeleteId(null); setConfirmDelete(false); }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger px-4 sm:px-6 py-2 rounded-full font-bold bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white shadow-lg transition text-sm sm:text-base w-full sm:w-auto"
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
            <div className="flex items-center justify-center min-h-screen px-4 py-4">
              <div className="fixed inset-0 bg-gradient-to-br from-blue-900/80 to-blue-400/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />
              <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 w-full max-w-lg mx-auto z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <Edit className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                  <Dialog.Title className="text-xl sm:text-2xl font-extrabold text-blue-900 dark:text-blue-200">Edit Event</Dialog.Title>
                </div>
                <form onSubmit={handleUpdateEvent} className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2 text-sm sm:text-base">Title</label>
                    <input
                      name="title"
                      value={editForm.title}
                      onChange={handleEditFormChange}
                      className="input w-full text-sm sm:text-base"
                      required
                      maxLength={100}
                      placeholder="Event Title"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2 text-sm sm:text-base">Location</label>
                    <input
                      name="location"
                      value={editForm.location}
                      onChange={handleEditFormChange}
                      className="input w-full text-sm sm:text-base"
                      required
                      maxLength={100}
                      placeholder="Event Location"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2 text-sm sm:text-base">Description</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                      className="input w-full text-sm sm:text-base"
                      required
                      maxLength={500}
                      placeholder="Event Description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2 text-sm sm:text-base">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={handleEditFormChange}
                        className="input w-full text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2 text-sm sm:text-base">Time</label>
                      <input
                        type="time"
                        name="time"
                        value={editForm.time}
                        onChange={handleEditFormChange}
                        className="input w-full text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-2 text-sm sm:text-base">Max Volunteers</label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.maxVolunteers[editForm.roles[0]] || 1}
                      onChange={e => setEditForm(prev => ({
                        ...prev,
                        maxVolunteers: { ...prev.maxVolunteers, [editForm.roles[0]]: Number(e.target.value) }
                      }))}
                      className="input w-full text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-6">
                    <button
                      type="button"
                      className="btn btn-secondary px-4 sm:px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm sm:text-base w-full sm:w-auto"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4 sm:px-6 py-2 rounded-full font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg transition text-sm sm:text-base w-full sm:w-auto"
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
            <div className="flex items-center justify-center min-h-screen px-4 py-4">
              <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
              <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md mx-auto z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
                <Dialog.Title className="text-lg sm:text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" /> 
                  Assign Volunteers
                </Dialog.Title>
                
                {/* Show currently assigned volunteers */}
                {eventVolunteers.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Currently Assigned:</h4>
                      {(() => {
                        // Check for duplicates
                        const volunteerCounts = eventVolunteers.reduce((counts: Record<string, number>, id) => {
                          counts[id] = (counts[id] || 0) + 1;
                          return counts;
                        }, {});
                        const hasDuplicates = Object.values(volunteerCounts).some(count => count > 1);
                        return hasDuplicates && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            ⚠️ Duplicates detected
                          </span>
                        );
                      })()}
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {eventVolunteers.map(volunteerId => {
                        const volunteer = allVolunteers.find(v => v.id === volunteerId) || { id: volunteerId, name: volunteerId };
                        return (
                          <div key={volunteerId} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/30 rounded text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-700 dark:text-green-300">{volunteer.name || volunteer.id}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Show available volunteers for assignment */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available for Assignment:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allVolunteers.length === 0 ? (
                      <div className="text-gray-500 text-sm text-center py-4">
                        {eventVolunteers.length > 0 
                          ? "All available volunteers are already assigned to this event." 
                          : "No volunteers found or all volunteers are already assigned to this event."}
                      </div>
                    ) : allVolunteers.map(v => (
                      <label key={v.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eventVolunteers.includes(v.id)}
                          onChange={() => handleToggleVolunteer(v.id)}
                          className="accent-green-600 h-4 w-4 sm:h-5 sm:w-5"
                          disabled={!eventVolunteers.includes(v.id) && maxReached}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {v.name || v.id}
                          </div>
                          <div className="text-xs text-gray-500 flex gap-2">
                            <span className="truncate">{v.role || 'volunteer'}</span>
                            <span className="truncate">{v.status || '-'}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {maxReached && (
                  <div className="text-xs text-red-500 mt-3 text-center">
                    Maximum number of volunteers assigned for this event.
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mt-6">
                  <button 
                    className="btn btn-warning px-4 sm:px-6 py-2 rounded-full font-semibold bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-lg transition text-sm sm:text-base w-full sm:w-auto" 
                    onClick={handleRemoveDuplicateAssignments}
                    title="Remove duplicate volunteer assignments"
                  >
                    Remove Duplicates
                  </button>
                  <button 
                    className="btn btn-secondary px-4 sm:px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition text-sm sm:text-base w-full sm:w-auto" 
                    onClick={() => setShowAssignModal(false)}
                  >
                    Close
                  </button>
                  {eventVolunteers.length > 0 && (
                    <button 
                      className="btn btn-primary px-4 sm:px-6 py-2 rounded-full font-bold bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white shadow-lg transition text-sm sm:text-base w-full sm:w-auto" 
                      onClick={handleAssignSelected}
                    >
                      Assign Selected
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  );
} 