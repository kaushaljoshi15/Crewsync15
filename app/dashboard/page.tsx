"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
        { id: Math.random().toString(), text: `New Task created: "${createdTask.title}"`, time: timeStr },
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
        { id: Math.random().toString(), text: `Task #${deletedId} deleted`, time: timeStr },
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
  const columns: { title: string; status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"; color: string }[] = [
    { title: "To Do", status: "TODO", color: "border-slate-500 text-slate-300" },
    { title: "In Progress", status: "IN_PROGRESS", color: "border-blue-500 text-blue-400" },
    { title: "Review", status: "REVIEW", color: "border-amber-500 text-amber-400" },
    { title: "Completed", status: "DONE", color: "border-emerald-500 text-emerald-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              CS
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden sm:block">CrewSync</span>
          </Link>

          {/* Crew Selector */}
          <div className="h-6 w-px bg-slate-800 mx-2" />
          <div className="flex items-center gap-2">
            <select
              value={selectedCrew?.id || ""}
              onChange={(e) => {
                const found = crews.find((c) => c.id === Number(e.target.value));
                if (found) setSelectedCrew(found);
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
              title="Create new crew"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Live Engine Indicators & User Profile */}
        <div className="flex items-center gap-4">
          {/* WebSocket Status Badge */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
            isConnected 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {isConnected ? "Go WebSocket Live" : "Reconnecting..."}
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <span>⚡ Go API: Sub-1ms Latency</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">{currentUser?.name || "Team Member"}</div>
              <div className="text-xs text-slate-400 capitalize">{currentUser?.role || "Volunteer"}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left / Central Workspace: Kanban Board */}
        <main className="flex-1 p-6 overflow-x-auto overflow-y-auto">
          
          {/* Crew Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                {selectedCrew ? selectedCrew.name : "Select or Create a Crew"}
                {selectedCrew && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-normal">
                    {members.length} Members
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {selectedCrew?.description || "Real-time task synchronization across connected team sessions."}
              </p>
            </div>

            {selectedCrew && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Invite Member
                </button>

                <button
                  onClick={() => setShowCreateTask(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </button>
              </div>
            )}
          </div>

          {/* Kanban Columns Grid */}
          {!selectedCrew ? (
            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center mb-4 text-2xl">
                🚀
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Crew Selected</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                Create a new crew or select an existing team to begin live task synchronization.
              </p>
              <button
                onClick={() => setShowCreateCrew(true)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
              >
                Create First Crew
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-w-[768px]">
              {columns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.status);
                return (
                  <div
                    key={col.status}
                    className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-[500px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          col.status === "TODO" ? "bg-slate-400" :
                          col.status === "IN_PROGRESS" ? "bg-blue-400" :
                          col.status === "REVIEW" ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                        <h3 className="font-semibold text-sm text-slate-200">{col.title}</h3>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task Cards */}
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {colTasks.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-600 italic">
                          No tasks in this stage
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl shadow-sm transition hover:shadow-md hover:border-slate-600 group flex flex-col justify-between"
                          >
                            <div>
                              {/* Priority Badge & Delete */}
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  task.priority === "URGENT" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                  task.priority === "HIGH" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                  task.priority === "LOW" ? "bg-slate-500/20 text-slate-400 border border-slate-500/30" :
                                  "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                }`}>
                                  {task.priority}
                                </span>

                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1"
                                  title="Delete task"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>

                              <h4 className="font-medium text-sm text-slate-100 leading-snug mb-1">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Status Movement Buttons */}
                            <div className="pt-3 mt-2 border-t border-slate-700/50 flex items-center justify-between">
                              <span className="text-[11px] text-slate-500">Move:</span>
                              <div className="flex gap-1">
                                {col.status !== "TODO" && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task.id, "TODO")}
                                    className="px-1.5 py-0.5 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
                                    title="Move to To Do"
                                  >
                                    To Do
                                  </button>
                                )}
                                {col.status !== "IN_PROGRESS" && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}
                                    className="px-1.5 py-0.5 text-[10px] bg-blue-600/30 hover:bg-blue-600 text-blue-300 rounded"
                                    title="Move to In Progress"
                                  >
                                    Progress
                                  </button>
                                )}
                                {col.status !== "DONE" && (
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task.id, "DONE")}
                                    className="px-1.5 py-0.5 text-[10px] bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 rounded"
                                    title="Mark Done"
                                  >
                                    Done
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar: Real-Time Activity Feed & Crew Members */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/40 p-5 hidden xl:flex flex-col gap-6">
          
          {/* Live Activity Feed */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Activity Stream
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {activityLog.length === 0 ? (
                <div className="text-slate-600 italic text-center py-6">
                  Listening for real-time WebSocket events...
                </div>
              ) : (
                activityLog.map((act) => (
                  <div key={act.id} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                    <div className="text-slate-300 font-medium">{act.text}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{act.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Members Roster */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Team Roster ({members.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px]">
                      {m.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-200 font-medium">{m.user_name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 capitalize">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Project Crew</h2>
            <form onSubmit={handleCreateCrew} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Crew Name</label>
                <input
                  type="text"
                  required
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  placeholder="e.g. Hackathon Alpha Team"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={newCrewDesc}
                  onChange={(e) => setNewCrewDesc(e.target.value)}
                  placeholder="Goals, roles, and project execution scope..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCrew(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-blue-600/30"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Create Task in {selectedCrew?.name}</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement WebSocket rate limiter"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details, acceptance criteria..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e: any) => setNewTaskPriority(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-blue-600/30"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Member Email</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Role</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-lg shadow-blue-600/30"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
