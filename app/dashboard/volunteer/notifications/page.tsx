"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: any;
}

export default function VolunteerNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    // Real-time listeners for notifications
    // TODO: Fetch notifications from your own database
    setIsLoading(false);
        const userNotifs = prev.filter(n => n.userId !== 'all');
        const allNotifs = [...userNotifs, ...globalNotifs].sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
        return allNotifs;
      });
      setIsLoading(false);
    });
    return () => {
      unsubUser();
      unsubGlobal();
    };
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 py-10 px-4 relative">
        <button
          onClick={() => router.push('/dashboard/volunteer')}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 z-20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Bell className="h-7 w-7" /> Notifications
          </h1>
          {isLoading ? (
            <div className="text-center text-gray-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500">No notifications yet.</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-2xl p-6 border shadow-lg flex flex-col gap-2 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 ${
                    notif.type === "success"
                      ? "border-green-400"
                      : notif.type === "warning"
                      ? "border-yellow-400"
                      : notif.type === "error"
                      ? "border-red-400"
                      : "border-indigo-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        notif.type === "success"
                          ? "bg-green-400"
                          : notif.type === "warning"
                          ? "bg-yellow-400"
                          : notif.type === "error"
                          ? "bg-red-400"
                          : "bg-indigo-400"
                      }`}
                    ></span>
                    <span className="font-semibold text-lg text-gray-900 dark:text-white">{notif.title}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200">{notif.message}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : ""}
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