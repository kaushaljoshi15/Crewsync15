"use client";

import { motion } from "framer-motion";
import { Activity, Zap, Server, Users } from "lucide-react";

const stats = [
  { label: "API Roundtrip Latency", value: "< 1.2 ms", change: "Go Zero-Alloc", icon: Zap },
  { label: "WebSocket Broadcast", value: "100K+ QPS", change: "Goroutine Pool", icon: Activity },
  { label: "Microservice Memory Footprint", value: "0.76 MB", change: "Ultra-Lightweight", icon: Server },
  { label: "Distributed Rate Limiter", value: "Atomic 10/min", change: "Redis 7 Cluster", icon: Users },
];

export default function StatsCounter() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <Icon className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono mb-1">
                {stat.value}
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {stat.change}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
