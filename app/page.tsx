import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-hidden relative font-sans flex flex-col items-center">
      
      {/* --- Global Background Effects --- */}
      {/* Soft blue ambient glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply" />
      
      {/* Pure CSS Geometric Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none" />

      {/* --- Floating Frosted Navbar --- */}
      <nav className="fixed top-6 z-50 w-full max-w-5xl px-6">
        <div className="mx-auto flex h-14 items-center justify-between rounded-full border border-slate-200/80 bg-white/70 px-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center font-bold text-xs text-white shadow-sm group-hover:scale-105 transition-transform">
              CS
            </div>
            <span className="font-bold tracking-tight text-slate-900">CrewSync</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200 hidden sm:block"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-medium bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="w-full max-w-6xl px-6 pt-40 pb-20 flex flex-col items-center text-center z-10">
        
        {/* Status Badge */}
        <a href="#features" className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide mb-8 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          CrewSync v2.0 Platform Live
          <svg className="w-3 h-3 ml-1 text-blue-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </a>
        
        {/* Hero Typography */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1] max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500 pb-2">
          Coordinate your crew. <br className="hidden md:block" /> Secure your operations.
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium">
          The unified operating system for event logistics. Manage volunteers, synchronize shift data, and secure your team architecture with an enterprise-grade backend.
        </p>
        
        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 shadow-[0_8px_20px_rgb(37,99,235,0.25)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            Deploy Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm transition-all flex items-center justify-center"
          >
            Sign in to Workspace
          </Link>
        </div>
      </main>

      {/* --- High-Fidelity App UI Mockup --- */}
      <section className="w-full max-w-5xl px-6 relative z-20 pb-32 perspective-[2000px]">
        {/* Decorative Glow behind mockup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-400/20 blur-[120px] -z-10" />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden mt-4 relative flex flex-col transform-gpu rotate-x-[2deg] scale-[1.01] hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out">
          
          {/* OS Window Header */}
          <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center px-4 justify-between">
            <div className="flex gap-2.5">
              <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-red-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-amber-400 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300 hover:bg-green-500 transition-colors cursor-pointer"></div>
            </div>
            <div className="h-7 w-64 bg-white rounded-md text-[11px] text-slate-500 flex items-center justify-center font-mono tracking-wider border border-slate-200 shadow-sm">
              <svg className="w-3 h-3 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              crewsync.app/workspaces
            </div>
            <div className="w-16"></div> {/* Spacer */}
          </div>

          <div className="w-full flex-1 flex h-[550px]">
            {/* Mockup Sidebar */}
            <div className="hidden md:flex w-64 border-r border-slate-200 p-4 flex-col gap-1.5 bg-slate-50/50">
              <div className="mb-4 px-2">
                <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
                  <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white shadow-sm">CS</div>
                  Alpha Event Team
                </div>
              </div>
              <div className="h-9 flex items-center px-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold cursor-default">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Command Center
              </div>
              <div className="h-9 flex items-center px-3 rounded-lg text-slate-500 text-xs font-medium hover:text-slate-900 hover:bg-slate-100 cursor-default transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Personnel Directory
              </div>
              <div className="h-9 flex items-center px-3 rounded-lg text-slate-500 text-xs font-medium hover:text-slate-900 hover:bg-slate-100 cursor-default transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Shift Scheduler
              </div>
              
              <div className="mt-auto h-14 rounded-xl border border-slate-200 bg-white flex items-center px-3 gap-3 shadow-sm">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">System Admin</span>
                    <span className="text-[10px] text-slate-500">PostgreSQL Verified</span>
                 </div>
              </div>
            </div>

            {/* Mockup Main Content Area */}
            <div className="flex-1 p-8 bg-white overflow-hidden">
               <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Live Operations</h3>
                    <div className="flex items-center mt-1.5 gap-2">
                      <span className="flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
                      <p className="text-xs text-slate-500 font-mono tracking-wide">SYNCED: SECONDS AGO</p>
                    </div>
                  </div>
                  <div className="h-9 px-4 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white rounded-lg text-xs font-semibold flex items-center shadow-sm transition-colors">
                    + Dispatch Crew
                  </div>
               </div>

               {/* KPI Metric Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                 <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500">Total Volunteers</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">+12%</span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">142</span>
                 </div>
                 <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500">Active Deployments</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Optimal</span>
                    </div>
                    <span className="text-3xl font-bold text-blue-600">28</span>
                 </div>
                 <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Action Req</span>
                    </div>
                    <span className="text-3xl font-bold text-slate-900">7</span>
                 </div>
               </div>

               {/* Advanced Data Table Mockup */}
               <div className="w-full border border-slate-200 rounded-xl bg-white overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                  <div className="h-11 border-b border-slate-200 flex items-center px-5 gap-4 text-[11px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">
                    <div className="w-2/5">Personnel</div>
                    <div className="w-1/4">Assigned Role</div>
                    <div className="w-1/4">Status</div>
                    <div className="w-10"></div>
                  </div>
                  
                  {/* Row 1 */}
                  <div className="h-16 border-b border-slate-100 flex items-center px-5 gap-4 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <div className="w-2/5 flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">Sarah Jenkins</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: VOL-882</div>
                      </div>
                    </div>
                    <div className="w-1/4 font-medium text-slate-600 text-xs">Event Coordinator</div>
                    <div className="w-1/4">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center w-max gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> On-Site
                      </span>
                    </div>
                    <div className="w-10 text-slate-400 hover:text-slate-600 cursor-pointer text-lg">•••</div>
                  </div>

                  {/* Row 2 */}
                  <div className="h-16 border-b border-slate-100 flex items-center px-5 gap-4 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <div className="w-2/5 flex items-center gap-3">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" alt="" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">Marcus Chen</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: VOL-104</div>
                      </div>
                    </div>
                    <div className="w-1/4 font-medium text-slate-600 text-xs">Technical Support</div>
                    <div className="w-1/4">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 flex items-center w-max gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Dispatched
                      </span>
                    </div>
                    <div className="w-10 text-slate-400 hover:text-slate-600 cursor-pointer text-lg">•••</div>
                  </div>

                  {/* Row 3 */}
                  <div className="h-16 flex items-center px-5 gap-4 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <div className="w-2/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">AR</div>
                      <div>
                        <div className="font-bold text-slate-900">Alex Rivera</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: MGR-002</div>
                      </div>
                    </div>
                    <div className="w-1/4 font-medium text-slate-600 text-xs">Stage Manager</div>
                    <div className="w-1/4">
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center w-max gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> On Break
                      </span>
                    </div>
                    <div className="w-10 text-slate-400 hover:text-slate-600 cursor-pointer text-lg">•••</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="w-full max-w-6xl px-6 py-24 relative z-10">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Engineered for absolute control.</h2>
          <p className="text-slate-500 text-lg mt-4 leading-relaxed font-medium">Everything a modern development team needs to manage authentication, roles, and real-time operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">Enterprise Security</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Protect your endpoints with secure session management, strict JWT validation, and environment-isolated PostgreSQL database connections.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">Frictionless OAuth Flow</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Accelerate user onboarding with native Google Authentication integration. Seamlessly map provider IDs directly to your relational database.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all group shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
               <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">Relational Architecture</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Custom-built PostgreSQL schema. Query performance perfectly optimized for high-volume shift tracking and complex user role delegation.
            </p>
          </div>
        </div>
      </section>
      
      {/* --- Footer --- */}
      <footer className="w-full border-t border-slate-200 bg-slate-50 py-10 mt-12 z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md text-white bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center font-bold text-[10px] shadow-sm">
                CS
              </div>
              <span className="font-bold tracking-tight text-slate-900">CrewSync Platform</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500 font-semibold">
            <a href="#" className="hover:text-slate-900 transition-colors">Documentation</a>
            <a href="#" className="hover:text-slate-900 transition-colors">API Reference</a>
            <a href="#" className="hover:text-slate-900 transition-colors">GitHub</a>
          </div>
          <p className="text-slate-400 text-xs font-semibold">© {new Date().getFullYear()} CrewSync. Built for modern teams.</p>
        </div>
      </footer>
    </div>
  );
}