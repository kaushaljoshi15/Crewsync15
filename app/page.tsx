"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Hero3DCanvas from "@/components/Hero3DCanvas";
import FeatureCards3D from "@/components/FeatureCards3D";
import StatsCounter from "@/components/StatsCounter";
import { 
  ArrowRight, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Code2, 
  Database 
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative font-sans">
      
      {/* --- Ambient Radial Glows --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute top-[900px] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] -z-10 pointer-events-none" />

      {/* --- Top Navigation Bar --- */}
      <nav className="fixed top-5 inset-x-0 z-50 max-w-5xl mx-auto px-6">
        <div className="flex h-14 items-center justify-between rounded-full border border-slate-800/80 bg-slate-900/70 px-6 backdrop-blur-2xl shadow-2xl shadow-black/50">
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-500/25">
              CS
            </div>
            <span className="font-bold tracking-tight text-white text-base">CrewSync</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Architecture</a>
            <a href="#metrics" className="hover:text-white transition-colors">Performance</a>
            <a href="#docker" className="hover:text-white transition-colors">Distributed Stack</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-xs font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 px-4 py-2 rounded-full transition-all duration-200 shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-1.5"
            >
              Launch App
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section with 3D Canvas --- */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
        
        {/* 3D WebGL Three.js Particle Core */}
        <Hero3DCanvas />

        {/* Status Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-xs font-semibold tracking-wide mb-8 backdrop-blur-xl shadow-lg shadow-cyan-950/50"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          CrewSync Distributed Go Architecture v2.0 Live
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400"
        >
          Real-Time Crew Logistics. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
            Powered by High-Concurrency Go.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-normal"
        >
          Coordinate distributed event crews and volunteer shifts with sub-millisecond WebSocket synchronization, Redis rate-limited APIs, and automated PostgreSQL connection pooling.
        </motion.p>

        {/* Hero CTA Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all duration-200 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            Open Live Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link 
            href="/register" 
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-xl text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 backdrop-blur"
          >
            <Terminal className="h-4 w-4 text-cyan-400" />
            Create Account
          </Link>
        </motion.div>
      </section>

      {/* --- Live Performance Metrics Counter --- */}
      <section id="metrics" className="border-y border-slate-800/80 bg-slate-900/20 backdrop-blur-md">
        <StatsCounter />
      </section>

      {/* --- 3D Feature Architecture Showcase --- */}
      <section id="features" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4 mb-4">
            Engineered for Tier-1 Scale & Resilience
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A production-grade distributed stack designed to showcase Clean Architecture, high-concurrency Goroutines, and containerized orchestration.
          </p>
        </div>

        <FeatureCards3D />
      </section>

      {/* --- Distributed Container Grid Showcase --- */}
      <section id="docker" className="py-20 border-t border-slate-800/80 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl p-8 sm:p-12 bg-slate-900/70 border border-slate-800 relative overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              <div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase font-semibold">
                  Orchestrated Microservices
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-2 mb-4">
                  4 Independent Docker Containers Running in Complete Isolation
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Every layer is containerized with multi-stage Alpine builders, automated health probes, and internal bridge networking for maximum security.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <Code2 className="h-4 w-4 text-cyan-400" />
                    <div>
                      <span className="font-semibold text-white">Go Backend Microservice:</span>
                      <span className="text-slate-400 ml-1">Fiber v2 + Native WebSocket Hub (:8080)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <Database className="h-4 w-4 text-blue-400" />
                    <div>
                      <span className="font-semibold text-white">PostgreSQL 16 Engine:</span>
                      <span className="text-slate-400 ml-1">pgxpool connection pool with auto-migrations (:5432)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-white">Redis 7 Distributed Cache:</span>
                      <span className="text-slate-400 ml-1">Token-Bucket sliding window rate limiter (:6379)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <div>
                      <span className="font-semibold text-white">Next.js 15 Application:</span>
                      <span className="text-slate-400 ml-1">Turbopack SSR + Real-Time Kanban client (:3000)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-slate-300 shadow-2xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-slate-400">docker-compose.yml</span>
                  </div>
                  <span className="text-emerald-400">ALL 4 HEALTHY</span>
                </div>

                <pre className="text-slate-400 leading-relaxed overflow-x-auto">
{`$ docker compose ps
NAME               IMAGE                   STATUS
crewsync_backend   crewsync-backend:prod   Up (healthy) :8080
crewsync_frontend  crewsync-frontend:prod  Up :3000
crewsync_postgres  postgres:16-alpine      Up (healthy) :5432
crewsync_redis     redis:7-alpine          Up (healthy) :6379`}
                </pre>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-slate-800/80 py-10 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-bold text-white">CrewSync</span> — High-Performance Distributed Event Operations
          </div>
          <div>
            Engineered with Go, Next.js 15, Redis 7 & PostgreSQL 16
          </div>
        </div>
      </footer>

    </div>
  );
}