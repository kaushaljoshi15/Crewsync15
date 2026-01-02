"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { X, User } from "lucide-react";
import { useRouter } from "next/navigation";

const SHIFT_TYPES = ["Any", "Morning", "Afternoon", "Evening"];

export default function UpdateAvailabilityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [availability, setAvailability] = useState<number>(0);
  const [preferredShift, setPreferredShift] = useState<string>("Any");
  const [preferredRole, setPreferredRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const fetchPreferences = async () => {
      // TODO: Fetch user preferences from your own database
      setAvailability(0);
      setPreferredShift("Any");
      setPreferredRole("");
      setIsLoading(false);
    };
    fetchPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    // TODO: Update user preferences in your own database
    setIsSaving(false);
    router.push("/dashboard/volunteer");
  };

  return (
    <ProtectedRoute allowedRoles={["volunteer"]}>
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900 dark:to-orange-900 py-10 px-4 relative">
        <button
          onClick={() => router.push("/dashboard/volunteer")}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 z-20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-orange-700 dark:text-orange-300">Update Your Preferences</h1>
          </div>
          {isLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability: <span className="font-bold text-orange-600 dark:text-orange-300">{availability}%</span></label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={availability}
                  onChange={e => setAvailability(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Shift Type</label>
                <select
                  value={preferredShift}
                  onChange={e => setPreferredShift(e.target.value)}
                  className="input w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2"
                >
                  {SHIFT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Role</label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={e => setPreferredRole(e.target.value)}
                  placeholder="e.g. Registration, Security, Logistics"
                  className="input w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white px-4 py-2"
                />
              </div>
              <button
                className="btn btn-primary w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg shadow-lg transition disabled:opacity-50"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </button>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 