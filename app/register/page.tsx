"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { setToken } from "@/lib/api";
import { User, Mail, Lock, ShieldCheck, ArrowRight, Layers, Zap } from "lucide-react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google login failed");

      setToken(data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      if (data && data.requiresVerification) {
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
        
        {/* Left Visual Architecture Panel */}
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-slate-900/60 border-r border-slate-800">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/25">
              CS
            </div>
            <span className="text-xl font-bold tracking-tight text-white">CrewSync</span>
          </div>

          <div className="max-w-md">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Instant Workspace Provisioning
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mt-2 mb-4 leading-snug">
              Unify and coordinate your entire event operations team.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Create an account to manage volunteer rosters, synchronize live Kanban shift cards, and monitor team activities in real-time.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>PostgreSQL 16 Multi-Tenant Schema Isolation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>Asynchronous Go Email Worker Queue</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-mono">
            &copy; {new Date().getFullYear()} CrewSync Distributed Architecture.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex w-full lg:w-1/2 flex-col justify-center items-center p-8 sm:p-12 md:p-20 relative">
          <div className="w-full max-w-sm">
            
            <div className="flex lg:hidden items-center gap-2.5 mb-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                CS
              </div>
              <span className="text-xl font-bold tracking-tight text-white">CrewSync</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">Create Account</h2>
              <p className="text-xs sm:text-sm text-slate-400">Join CrewSync to start coordinating with your team.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-xs flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-rose-400 mt-1 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth */}
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google sign-in failed")}
                theme="filled_black"
                shape="pill"
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-950 px-3 text-slate-500 font-mono">or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Kaushal Joshi"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-400" />
                  Select Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition cursor-pointer"
                >
                  <option value="volunteer">Volunteer (Task Contributor)</option>
                  <option value="organizer">Organizer (Event Coordinator)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
                Login here
              </Link>
            </p>

          </div>
        </div>

      </div>
    </GoogleOAuthProvider>
  );
}