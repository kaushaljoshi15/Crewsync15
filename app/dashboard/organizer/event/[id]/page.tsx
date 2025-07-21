"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Users, BarChart3, Download, Mail, ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import jsPDF from "jspdf";
import { Dialog } from '@headlessui/react';

// Add VolunteerDoc type
interface VolunteerDoc {
  userId: string;
  role?: string;
  status?: string;
}

export default function OrganizerEventDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchEventAndVolunteers = async () => {
      setLoading(true);
      // Fetch event
      const docRef = doc(db, "events", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvent({ id: docSnap.id, ...docSnap.data() });
      }
      // Fetch volunteers for this event
      const vQuery = query(collection(db, "volunteers"), where("eventId", "==", id));
      const vSnap = await getDocs(vQuery);
      const volunteerDocs = vSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as VolunteerDoc) }));
      // Fetch user info for each volunteer
      const userIds = volunteerDocs.map(v => v.userId).filter(Boolean);
      let usersMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach(userDoc => {
          if (userIds.includes(userDoc.id)) {
            usersMap[userDoc.id] = userDoc.data();
          }
        });
      }
      // Merge volunteer and user info
      const volunteersWithUser = volunteerDocs.map(v => ({
        name: usersMap[v.userId]?.name || v.userId || "-",
        email: usersMap[v.userId]?.email || "",
        role: v.role || "-",
        status: v.status || "-",
      }));
      setVolunteers(volunteersWithUser);
      setLoading(false);
    };
    fetchEventAndVolunteers();
  }, [id]);

  // Progress chart mock data
  const total = volunteers.length;
  const confirmed = volunteers.filter(v => v.status === "Confirmed").length;
  const checkedIn = volunteers.filter(v => v.status === "Checked-in").length;

  const handleBack = () => router.push("/dashboard/organizer/event");

  const handleExportCSV = () => {
    const csvRows = [
      ["Name", "Role", "Status"],
      ...volunteers.map(v => [v.name, v.role, v.status])
    ];
    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title || "event"}-volunteers.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const docPdf = new jsPDF();
    docPdf.text(`Event: ${event.title}`, 10, 10);
    docPdf.text("Volunteer Assignment:", 10, 20);
    volunteers.forEach((v, i) => {
      docPdf.text(`${v.name} - ${v.role} - ${v.status}`, 10, 30 + i * 10);
    });
    docPdf.save(`${event.title || "event"}-volunteers.pdf`);
  };

  const handleEmailAll = () => {
    setShowEmailModal(true);
  };

  const handleSendEmail = () => {
    const emails = volunteers.map(v => v.email).filter(Boolean).join(",");
    window.location.href = `mailto:${emails}?subject=Event%20Update:%20${encodeURIComponent(event.title)}&body=${encodeURIComponent(emailMessage)}`;
    setShowEmailModal(false);
    setEmailMessage("");
  };

  return (
    <ProtectedRoute allowedRoles={["organizer"]}>
      <div className="relative max-w-4xl mx-auto py-10 px-4 bg-gray-50 dark:bg-slate-900 min-h-screen">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute right-0 top-0 mt-4 mr-2 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 z-10"
        >
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        {loading ? (
          <div>Loading event details...</div>
        ) : !event ? (
          <div>Event not found.</div>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-4 pt-2">
              <h1 className="text-3xl font-extrabold text-blue-900 dark:text-blue-200">{event.title}</h1>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold capitalize">{event.status}</span>
            </div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/70 dark:bg-slate-800/80 rounded-2xl shadow-xl p-8 border border-blue-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-200"><Users className="h-5 w-5 text-blue-400" /> Volunteer Assignment</h2>
                <table className="min-w-full text-sm mt-2 text-blue-100">
                  <thead>
                    <tr>
                      <th className="text-left py-2 font-semibold">Name</th>
                      <th className="text-left py-2 font-semibold">Email</th>
                      <th className="text-left py-2 font-semibold">Role</th>
                      <th className="text-left py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((v, i) => (
                      <tr key={i} className="border-t border-blue-800">
                        <td className="py-2">{v.name}</td>
                        <td className="py-2">{v.email}</td>
                        <td className="py-2">{v.role}</td>
                        <td className="py-2">{v.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-900/70 dark:bg-slate-800/80 rounded-2xl shadow-xl p-8 border border-blue-700 flex flex-col items-center justify-center">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-200"><BarChart3 className="h-5 w-5 text-blue-400" /> Event Progress</h2>
                <div className="w-full flex flex-col gap-2 text-blue-100">
                  <div className="flex justify-between"><span>Total Volunteers</span><span>{total}</span></div>
                  <div className="flex justify-between"><span>Confirmed</span><span>{confirmed}</span></div>
                  <div className="flex justify-between"><span>Checked-in</span><span>{checkedIn}</span></div>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 hover:from-indigo-600 hover:to-blue-500 text-white font-bold shadow transition"><Download className="h-5 w-5" /> Export CSV</button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-400 hover:from-gray-300 hover:to-gray-500 text-gray-900 font-bold shadow transition"><Download className="h-5 w-5" /> Export PDF</button>
              <button onClick={handleEmailAll} className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 text-white font-bold shadow transition"><Mail className="h-5 w-5" /> Email All Volunteers</button>
            </div>
          </>
        )}
      </div>
      {/* Email Modal */}
      <Dialog open={showEmailModal} onClose={() => setShowEmailModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          <Dialog.Panel className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto z-10 animate-fade-in">
            <Dialog.Title className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-200">Send Notice to All Volunteers</Dialog.Title>
            <textarea
              className="input w-full mb-4 min-h-[100px]"
              placeholder="Type your notice/message here..."
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
            />
            <div className="flex gap-4 justify-end">
              <button
                className="btn btn-secondary px-6 py-2 rounded-full font-semibold border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-6 py-2 rounded-full font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg transition"
                onClick={handleSendEmail}
                disabled={!emailMessage.trim()}
              >
                Send Email
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </ProtectedRoute>
  );
} 