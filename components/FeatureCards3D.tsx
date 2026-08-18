"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Radio, 
  GitBranch 
} from "lucide-react";

interface Feature {
  title: string;
  tagline: string;
  description: string;
  icon: typeof Zap;
  gradient: string;
  borderGlow: string;
}

const features: Feature[] = [
  {
    title: "Real-Time Concurrency Hub",
    tagline: "Goroutines & Channels",
    description: "Ultra-low latency WebSocket synchronization engine broadcasting state changes across distributed clients in sub-milliseconds.",
    icon: Radio,
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    borderGlow: "group-hover:border-blue-500/50",
  },
  {
    title: "Distributed Rate Limiter",
    tagline: "Redis 7 Token Bucket",
    description: "Protects critical auth & mutation APIs from DDoS and brute-force attacks with sliding-window atomic Redis counters.",
    icon: ShieldCheck,
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    borderGlow: "group-hover:border-emerald-500/50",
  },
  {
    title: "Multi-Tenant Crew Workspaces",
    tagline: "Clean Architecture & RBAC",
    description: "Enterprise-grade Role-Based Access Control dividing team leads, contributors, and observers with SQL connection pooling.",
    icon: Layers,
    gradient: "from-purple-600/20 via-pink-600/10 to-transparent",
    borderGlow: "group-hover:border-purple-500/50",
  },
  {
    title: "High-Performance Go Engine",
    tagline: "Fiber v2 & Zero-Alloc Router",
    description: "Handles tens of thousands of simultaneous requests consuming less than 1MB of memory per container instance.",
    icon: Cpu,
    gradient: "from-cyan-600/20 via-blue-600/10 to-transparent",
    borderGlow: "group-hover:border-cyan-500/50",
  },
  {
    title: "Asynchronous Background Workers",
    tagline: "Buffered Non-Blocking Queue",
    description: "5 dedicated background worker routines dispatching verification emails and event alerts without blocking the HTTP pipeline.",
    icon: Zap,
    gradient: "from-amber-600/20 via-orange-600/10 to-transparent",
    borderGlow: "group-hover:border-amber-500/50",
  },
  {
    title: "Containerized Microservices",
    tagline: "Multi-Stage Docker & Compose",
    description: "Production-ready Alpine images with automated database migrations, health probes, and isolated virtual networking.",
    icon: GitBranch,
    gradient: "from-rose-600/20 via-red-600/10 to-transparent",
    borderGlow: "group-hover:border-rose-500/50",
  },
];

export default function FeatureCards3D() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 relative z-10">
      {features.map((feat, idx) => {
        const IconComponent = feat.icon;
        return (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className={`group relative rounded-2xl p-7 bg-slate-900/60 backdrop-blur-xl border border-slate-800 transition-all duration-300 shadow-xl hover:shadow-2xl ${feat.borderGlow} cursor-pointer flex flex-col justify-between overflow-hidden`}
          >
            {/* Ambient Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

            <div>
              {/* Icon & Tag */}
              <div className="flex items-center justify-between mb-5">
                <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-100 group-hover:scale-110 group-hover:bg-slate-700/80 transition-all duration-300 shadow-md">
                  <IconComponent className="h-6 w-6 text-blue-400 group-hover:text-cyan-300 transition-colors" />
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/40">
                  {feat.tagline}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-cyan-100 transition-colors">
                {feat.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                {feat.description}
              </p>
            </div>

            {/* Bottom Tech Indicator */}
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Production Ready
              </span>
              <span className="font-mono text-[11px]">Sub-1ms</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
