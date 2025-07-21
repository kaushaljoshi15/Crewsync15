"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Calendar, MapPin, Users, Clock, CheckCircle, Crown, Bell } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function VolunteerEventDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [volunteerStatus, setVolunteerStatus] = useState<string>("");
  const [shifts, setShifts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    setIsLoading(true);
    // Fetch event details
    const fetchEvent = async () => {
      const eventDoc = await getDoc(doc(db, "events", id as string));
      if (eventDoc.exists()) {
        setEvent({ id: eventDoc.id, ...eventDoc.data() });
      }
    };
    // Fetch volunteer status for this event
    const fetchVolunteerStatus = async () => {
      const vQuery = query(collection(db, "volunteers"), where("eventId", "==", id), where("userId", "==", user.uid));
      const vSnap = await getDocs(vQuery);
      if (!vSnap.empty) {
        setVolunteerStatus(vSnap.docs[0].data().status || "");
      }
    };
    // Fetch shifts for this event and user
    const fetchShifts = async () => {
      const sQuery = query(collection(db, "shifts"), where("eventId", "==", id));
      const sSnap = await getDocs(sQuery);
      const allShifts = sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter shifts assigned to this user
      const myShifts = allShifts.filter((shift: any) => {
        if (!shift.assignedVolunteers) return false;
        return shift.assignedVolunteers.includes(user.uid);
      });
      setShifts(myShifts);
    };
    // Fetch notifications for this event and user (optional, mock for now)
    const fetchNotifications = async () => {
      setNotifications([]); // Replace with Firestore query if needed
    };
    fetchEvent();
    fetchVolunteerStatus();
    fetchShifts();
    fetchNotifications();
    setIsLoading(false);
  }, [id, user]);

  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading || !event ? (
            <div className="text-gray-500 dark:text-gray-300">Loading event details...</div>
          ) : (
            <>
              {/* Event Info */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2 mb-2">
                  <Calendar className="h-7 w-7" /> {event.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-700 dark:text-gray-200 mb-2">
                  <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />{event.date?.toDate ? event.date.toDate().toLocaleDateString() : String(event.date)}</span>
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" />{event.location}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400 mb-2">{event.description}</div>
                {/* Roles Needed, Progress, etc. (add if available in schema) */}
              </div>

              {/* Volunteer Status */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2"><Users className="h-5 w-5" /> My Status</h2>
                <div className="inline-block px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium">
                  {volunteerStatus || "Not Joined"}
                </div>
              </div>

              {/* Assigned Shifts */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2"><Crown className="h-5 w-5" /> My Assigned Shifts</h2>
                {shifts.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-300">No assigned shifts for this event.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {shifts.map(shift => (
                      <div key={shift.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{shift.title}</h4>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <Clock className="h-4 w-4 mr-2" />
                            {shift.startTime} - {shift.endTime}
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <MapPin className="h-4 w-4 mr-2" />
                            {shift.location}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <p className="font-medium mb-1">Duty:</p>
                            <p>{shift.description}</p>
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
                )}
              </div>

              {/* Notifications (optional, mock for now) */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2"><Bell className="h-5 w-5" /> Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-300">No notifications for this event.</div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden">
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                      {notifications.map((notification: any) => (
                        <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{notification.time}</p>
                            </div>
                            <div className={`w-2 h-2 rounded-full ml-4 ${notification.type === 'reminder' ? 'bg-yellow-400' : 'bg-blue-400'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 