"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  apiRequest, 
  getToken, 
  removeToken, 
  User, 
  Crew, 
  CrewMember, 
  Task 
} from "@/lib/api";
import { useWebSocket, LiveEvent } from "@/lib/useWebSocket";
import { 
  Plus, 
  Users, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Zap, 
  LogOut, 
  Trash2, 
  ChevronRight, 
  AlertCircle,
  Shield,
  Layers,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [members, setMembers] = useState<CrewMember[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLog, setActivityLog] = useState<{ id: string; text: string; time: string }[]>([]);

  // Modals state
  const [showCreateCrew, setShowCreateCrew] = useState(false);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewDesc, setNewCrewDesc] = useState("");

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");

  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("contributor");

  // Load User & Crews on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (_) {}
    }

    loadCrews();
  }, [router]);

  const loadCrews = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Crew[]>("/crews");
      setCrews(data || []);
      if (data && data.length > 0) {
        setSelectedCrew(data[0]);
      }
    } catch (err) {
      console.error("Failed to load crews:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load Tasks & Members when selected crew changes
  useEffect(() => {
    if (!selectedCrew) return;

    const loadCrewDetails = async () => {
      try {
        const [taskData, memberData] = await Promise.all([
          apiRequest<Task[]>(`/crews/${selectedCrew.id}/tasks`),
          apiRequest<CrewMember[]>(`/crews/${selectedCrew.id}/members`),
        ]);
        setTasks(taskData || []);
        setMembers(memberData || []);
      } catch (err) {
        console.error("Failed to load crew data:", err);
      }
    };

    loadCrewDetails();
  }, [selectedCrew]);

  // Real-Time WebSocket Event Listener
  const handleLiveEvent = useCallback((event: LiveEvent) => {
    const timeStr = new Date().toLocaleTimeString();

    if (event.type === "TASK_CREATED") {
      const createdTask: Task = event.payload;
      setTasks((prev) => {
        if (prev.some((t) => t.id === createdTask.id)) return prev;
        return [createdTask, ...prev];
      });
      setActivityLog((prev) => [
        { id: Math.random().toString(), text: `New task added: "${createdTask.title}"`, time: timeStr },
        ...prev.slice(0, 15),
      ]);
    } else if (event.type === "TASK_UPDATED") {
      const updatedTask: Task = event.payload;
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setActivityLog((prev) => [
        { id: Math.random().toString(), text: `Task updated: "${updatedTask.title}" ➔ ${updatedTask.status}`, time: timeStr },
        ...prev.slice(0, 15),
      ]);
    } else if (event.type === "TASK_DELETED") {
      const deletedId = event.payload.id;
      setTasks((prev) => prev.filter((t) => t.id !== deletedId));
      setActivityLog((prev) => [
        { id: Math.random().toString(), text: `Task #${deletedId} removed`, time: timeStr },
        ...prev.slice(0, 15),
      ]);
    } else if (event.type === "MEMBER_JOINED") {
      const newMember: CrewMember = event.payload;
      setMembers((prev) => {
        if (prev.some((m) => m.user_id === newMember.user_id)) return prev;
        return [...prev, newMember];
      });
      setActivityLog((prev) => [
        { id: Math.random().toString(), text: `${newMember.user_name} joined the crew!`, time: timeStr },
        ...prev.slice(0, 15),
      ]);
    }
  }, []);

  const { isConnected } = useWebSocket(selectedCrew?.id || null, handleLiveEvent);

  // Actions
  const handleCreateCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrewName.trim()) return;

    try {
      const created = await apiRequest<Crew>("/crews", {
        method: "POST",
        body: JSON.stringify({ name: newCrewName, description: newCrewDesc }),
      });
      setCrews((prev) => [created, ...prev]);
      setSelectedCrew(created);
      setShowCreateCrew(false);
      setNewCrewName("");
      setNewCrewDesc("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrew || !newTaskTitle.trim()) return;

    try {
      await apiRequest<Task>(`/crews/${selectedCrew.id}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
        }),
      });
      setShowCreateTask(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE") => {
    try {
      if (status === "DONE") {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#06b6d4", "#3b82f6", "#10b981", "#8b5cf6"]
        });
      }
      await apiRequest<Task>(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrew || !newMemberEmail.trim()) return;

    try {
      await apiRequest(`/crews/${selectedCrew.id}/members`, {
        method: "POST",
        body: JSON.stringify({
          user_email: newMemberEmail,
          role: newMemberRole,
        }),
      });
      setShowAddMember(false);
      setNewMemberEmail("");
      alert("Member added successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Kanban Columns
  const columns: { title: string; status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"; color: string; badge: string }[] = [
    { title: "To Do", status: "TODO", color: "border-slate-700 bg-slate-900/50", badge: "bg-slate-700 text-slate-300" },
    { title: "In Progress", status: "IN_PROGRESS", color: "border-blue-500/30 bg-blue-950/10", badge: "bg-blue-600/30 text-blue-300" },
    { title: "In Review", status: "REVIEW", color: "border-amber-500/30 bg-amber-950/10", badge: "bg-amber-600/30 text-amber-300" },
    { title: "Completed", status: "DONE", color: "border-emerald-500/30 bg-emerald-950/10", badge: "bg-emerald-600/30 text-emerald-300" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Glass Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg shadow-black/40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/25">
              CS
            </div>
            <span className="font-bold text-base tracking-tight text-white hidden sm:block">CrewSync</span>
          </Link>

          {/* Crew Selector */}
          <div className="h-5 w-px bg-slate-800 mx-1" />
          <div className="flex items-center gap-2">
            <select
              value={selectedCrew?.id || ""}
              onChange={(e) => {
                const found = crews.find((c) => c.id === Number(e.target.value));
                if (found) setSelectedCrew(found);
              }}
              className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium cursor-pointer"
            >
              {crews.length === 0 ? (
                <option value="">No Crews Available</option>
              ) : (
                crews.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>

            <button
              onClick={() => setShowCreateCrew(true)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition cursor-pointer"
              title="Create new crew"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Engine Indicators & User Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* WebSocket Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur ${
            isConnected 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}>
            <Radio className={`h-3 w-3 ${isConnected ? "animate-pulse text-emerald-400" : "text-amber-400"}`} />
            <span className="hidden md:inline">{isConnected ? "Go WebSocket Live" : "Connecting..."}</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Zap className="h-3 w-3" />
            <span>Go Engine &lt;1ms</span>
          </div>

          {/* User Sign Out */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{currentUser?.name || "Team Lead"}</div>
              <div className="text-[10px] text-slate-400 capitalize">{currentUser?.role || "Admin"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-medium transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Kanban Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Central Kanban Board */}
        <main className="flex-1 p-6 overflow-x-auto overflow-y-auto">
          
          {/* Crew Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                {selectedCrew ? selectedCrew.name : "Select or Create a Crew"}
                {selectedCrew && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-cyan-500/20 font-mono">
                    {members.length} {members.length === 1 ? "Member" : "Members"}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {selectedCrew?.description || "Real-time task synchronization across connected team sessions."}
              </p>
            </div>

            {selectedCrew && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Users className="w-4 h-4 text-cyan-400" />
                  Invite Member
                </button>

                <button
                  onClick={() => setShowCreateTask(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            )}
          </div>

          {/* Kanban Columns */}
          {!selectedCrew ? (
            <div className="h-96 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-3xl p-8 text-center bg-slate-900/20">
              <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
                <Layers className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Crew Selected</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
                Create a project crew or select an existing team to begin live task synchronization.
              </p>
              <button
                onClick={() => setShowCreateCrew(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                Create First Crew
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 min-w-[850px]">
              {columns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.status);
                return (
                  <div
                    key={col.status}
                    className={`rounded-2xl p-4 flex flex-col min-h-[550px] border ${col.color} backdrop-blur-md transition`}
                  >
                    {/* Column Title */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          col.status === "TODO" ? "bg-slate-400" :
                          col.status === "IN_PROGRESS" ? "bg-blue-400" :
                          col.status === "REVIEW" ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">{col.title}</h3>
                      </div>
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${col.badge}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task Cards Container */}
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      <AnimatePresence>
                        {colTasks.length === 0 ? (
                          <div className="text-center py-12 text-xs text-slate-600 italic">
                            Empty stage
                          </div>
                        ) : (
                          colTasks.map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="p-4 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl shadow-md transition-all group flex flex-col justify-between"
                            >
                              <div>
                                {/* Priority & Delete Button */}
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                                    task.priority === "URGENT" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                                    task.priority === "HIGH" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                                    task.priority === "LOW" ? "bg-slate-700/50 text-slate-400 border-slate-600/40" :
                                    "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                  }`}>
                                    {task.priority}
                                  </span>

                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1 cursor-pointer"
                                    title="Delete task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <h4 className="font-semibold text-sm text-slate-100 leading-snug mb-1">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Action Move Buttons */}
                              <div className="pt-3 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-mono">Status:</span>
                                <div className="flex gap-1.5">
                                  {col.status !== "TODO" && (
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, "TODO")}
                                      className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition cursor-pointer"
                                    >
                                      To Do
                                    </button>
                                  )}
                                  {col.status !== "IN_PROGRESS" && (
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}
                                      className="px-2 py-0.5 text-[10px] font-medium bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded border border-blue-500/30 transition cursor-pointer"
                                    >
                                      Progress
                                    </button>
                                  )}
                                  {col.status !== "DONE" && (
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, "DONE")}
                                      className="px-2 py-0.5 text-[10px] font-medium bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded border border-emerald-500/30 transition cursor-pointer flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="h-2.5 w-2.5" />
                                      Done
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar: Real-Time Stream & Team Roster */}
        <aside className="w-80 border-l border-slate-800/80 bg-slate-900/40 p-5 hidden xl:flex flex-col gap-6 backdrop-blur-md">
          
          {/* Live Activity Feed */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Activity Stream
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {activityLog.length === 0 ? (
                <div className="text-slate-600 italic text-center py-6">
                  Listening for real-time Go WebSocket events...
                </div>
              ) : (
                activityLog.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
                    <div className="text-slate-300 font-medium">{act.text}</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">{act.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Members Roster */}
          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              Team Roster ({members.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/70">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white text-[11px] shadow-sm">
                      {m.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-200 font-medium">{m.user_name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 capitalize font-mono">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* --- Modal: Create Crew --- */}
      {showCreateCrew && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              Create Project Crew
            </h2>
            <form onSubmit={handleCreateCrew} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Crew Name</label>
                <input
                  type="text"
                  required
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  placeholder="e.g. Distributed Core Operations"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <textarea
                  value={newCrewDesc}
                  onChange={(e) => setNewCrewDesc(e.target.value)}
                  placeholder="Goals, roles, and project execution scope..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCrew(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Create Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Create Task --- */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-400" />
              Create Task in {selectedCrew?.name}
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket rate limiter"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details, acceptance criteria..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e: any) => setNewTaskPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent ⚡</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Dispatch Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal: Add Member --- */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Add Crew Member
            </h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Member Email</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="contributor">Contributor</option>
                  <option value="observer">Observer</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Invite Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
