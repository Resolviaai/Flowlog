import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Menu, 
  X, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  FileSpreadsheet, 
  Calculator, 
  LayoutDashboard, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Users, 
  Briefcase, 
  FilePlay, 
  DollarSign, 
  Activity, 
  PlayCircle 
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-black min-h-screen text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-md py-4 border-b border-white/5" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-blue-900/20">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Flow Log</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#philosophy" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Philosophy</a>
            <button 
              onClick={() => navigate("/auth")}
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Login
            </button>
            <button 
              onClick={() => navigate("/auth")}
              className="bg-white text-black px-5 py-2 rounded-full font-medium text-sm hover:bg-zinc-200 transition-colors"
            >
              Get Early Access
            </button>
          </div>

          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 text-lg font-medium">Features</a>
              <a href="#philosophy" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 text-lg font-medium">Philosophy</a>
              <button onClick={() => navigate("/auth")} className="text-zinc-300 text-lg font-medium text-left">Login</button>
              <button onClick={() => navigate("/auth")} className="bg-white text-black px-5 py-3 rounded-xl font-medium text-center">Get Early Access</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 text-center px-4 md:px-6 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium tracking-wide backdrop-blur-sm"
            >
              For Freelancers & Agencies
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]"
            >
              One dashboard. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Zero confusion.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Flow Log is the lightweight multi-tenant work & payment tracking system that replaces WhatsApp chaos and Excel sheets with pure clarity.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={() => navigate("/auth")}
                className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start for free 
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
              </button>
              <button 
                onClick={() => navigate("/auth")}
                className="group px-8 py-4 bg-white/5 text-white font-medium rounded-full border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-sm w-full sm:w-auto"
              >
                <PlayCircle className="w-5 h-5 text-blue-400" />
                See how it works
              </button>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-500 text-sm animate-bounce"
          >
            Scroll to explore
          </motion.div>
        </section>

        {/* Comparison Section */}
        <section className="bg-black text-white py-24 px-6 overflow-hidden border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                Stop the <span className="text-red-500">Chaos</span>. Start the <span className="text-blue-500">Flow</span>.
              </motion.h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Freelancers and clients suffer from no shared source of truth. The result? Confusion, manual math, and emotional friction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative">
              {/* Old Way */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-8 md:p-10 rounded-3xl bg-zinc-900/30 border border-red-500/20 backdrop-blur-sm relative overflow-hidden group hover:bg-zinc-900/50 transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <XCircle size={120} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-red-400">
                  <XCircle className="w-6 h-6" /> The Old Way
                </h3>
                <ul className="space-y-6 text-zinc-300">
                  <li className="flex items-start gap-4">
                    <MessageSquare className="text-red-500 mt-1 shrink-0 w-5 h-5" />
                    <span>"Bro how many are pending?" WhatsApp messages</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <FileSpreadsheet className="text-red-500 mt-1 shrink-0 w-5 h-5" />
                    <span>Messy Excel sheets that act as different versions of truth</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Calculator className="text-red-500 mt-1 shrink-0 w-5 h-5" />
                    <span>Manual payment math & surprise invoices</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <XCircle className="text-red-500 mt-1 shrink-0 w-5 h-5" />
                    <span>Emotional friction around money conversations</span>
                  </li>
                </ul>
              </motion.div>

              {/* Flowlog Way */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-8 md:p-10 rounded-3xl bg-blue-900/10 border border-blue-500/30 backdrop-blur-sm relative overflow-hidden group hover:bg-blue-900/20 transition-colors"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircle2 size={120} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-blue-400">
                  <CheckCircle2 className="w-6 h-6" /> The Flow Log Way
                </h3>
                <ul className="space-y-6 text-zinc-200">
                  <li className="flex items-start gap-4">
                    <LayoutDashboard className="text-blue-500 mt-1 shrink-0 w-5 h-5" />
                    <span>One shared dashboard. Zero confusion.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <ShieldCheck className="text-blue-500 mt-1 shrink-0 w-5 h-5" />
                    <span>Instant status transparency (Pending, Done, Revision)</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <Zap className="text-blue-500 mt-1 shrink-0 w-5 h-5" />
                    <span>Automated math: Total - Paid = Remaining</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <CheckCircle2 className="text-blue-500 mt-1 shrink-0 w-5 h-5" />
                    <span>Trust infrastructure for professionals</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-zinc-950 py-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-white mb-6"
              >
                Built on <span className="text-blue-500">System Thinking</span>
              </motion.h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                Flow Log isn't just a list of tasks. It's a hierarchy designed for clarity.
              </p>
            </div>

            {/* Dashboard Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 mb-24 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Project: Q3 Content Campaign</h3>
                  <p className="text-zinc-400">Client: TechFlow Inc.</p>
                </div>
                <div className="hidden md:block">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm border border-emerald-500/20">Active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-sm mb-1">Total Items</p>
                  <p className="text-3xl font-bold text-white">42</p>
                </div>
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-emerald-400">35</p>
                </div>
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-sm mb-1">Pending</p>
                  <p className="text-3xl font-bold text-amber-400">7</p>
                </div>
                <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800/50">
                  <p className="text-zinc-500 text-sm mb-1">Remaining</p>
                  <p className="text-3xl font-bold text-blue-400">$1,400</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-12 text-zinc-500 text-sm px-4 pb-2 border-b border-zinc-800">
                  <div className="col-span-6 md:col-span-5">Deliverable</div>
                  <div className="col-span-3 md:col-span-2 text-center">Status</div>
                  <div className="col-span-3 md:col-span-2 text-right">Amount</div>
                  <div className="hidden md:block col-span-3 text-right">Date</div>
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-12 items-center px-4 py-3 bg-zinc-950/30 rounded-xl border border-zinc-800/30 hover:bg-zinc-800/30 transition-colors">
                    <div className="col-span-6 md:col-span-5 font-medium text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">V{i}</div>
                      Social Media Clip #{i}
                    </div>
                    <div className="col-span-3 md:col-span-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs border ${i === 2 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                        {i === 2 ? "Pending" : "Done"}
                      </span>
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right text-zinc-300">$200.00</div>
                    <div className="hidden md:block col-span-3 text-right text-zinc-500">Oct {10 + i}, 2023</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Layers size={24} />, title: "Workspace", desc: "Your freelance business hub. Everything flows inside here." },
                { icon: <Users size={24} />, title: "Clients", desc: "Manage multiple clients with strict data isolation." },
                { icon: <Briefcase size={24} />, title: "Projects", desc: "Organize work into clear, trackable projects." },
                { icon: <FilePlay size={24} />, title: "Deliverables", desc: "Track individual videos, designs, or tasks." },
                { icon: <DollarSign size={24} />, title: "Payments", desc: "Log payments and see outstanding balances instantly." },
                { icon: <Activity size={24} />, title: "Live Status", desc: "Real-time updates on what's done, pending, or in revision." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-blue-500/30 transition-colors group"
                >
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors text-white">
                    {item.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Section */}
        <ValueSection />

        {/* Philosophy Section */}
        <section id="philosophy" className="bg-zinc-950 py-24 px-6 relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <span className="text-blue-500 font-semibold tracking-wider text-sm uppercase">Our Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-bold text-white mt-4 mb-8">
                Minimal. <br />
                Structured. <br />
                <span className="text-zinc-500">Transparent.</span>
              </h2>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                We don't build features unless they reduce confusion, manual math, or friction. If it doesn't help you get paid or track work, it's not here.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-zinc-900/50 p-8 border border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                <h3 className="text-xl font-bold text-white mb-3">No Clutter</h3>
                <p className="text-zinc-400">User should understand everything in &lt;10 seconds. No feature maze. No hidden menus.</p>
              </div>
              <div className="bg-zinc-900/50 p-8 border border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                <h3 className="text-xl font-bold text-white mb-3">Data-First</h3>
                <p className="text-zinc-400">Numbers don't lie. We prioritize showing you the totals, the pending items, and the money.</p>
              </div>
              <div className="bg-zinc-900/50 p-8 border border-zinc-800 rounded-2xl hover:bg-zinc-800/50 transition-colors">
                <h3 className="text-xl font-bold text-white mb-3">Trust Infrastructure</h3>
                <p className="text-zinc-400">Flow Log is not a social network. It's a professional tool to build trust through clarity.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-black py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight"
            >
              Ready to remove the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">confusion?</span>
            </motion.h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              One dashboard for your peace of mind. Join the waitlist for early access.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button 
                onClick={() => navigate("/auth")}
                className="bg-white text-black text-lg font-bold px-10 py-5 rounded-full flex items-center gap-3 hover:bg-zinc-200 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Lock the Idea <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-white text-xl font-bold tracking-tight">Flow Log</span>
          </div>
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Flow Log. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ValueSection() {
  const [activeTab, setActiveTab] = useState<"freelancer" | "client">("freelancer");
  const navigate = useNavigate();

  const freelancerBenefits = [
    "Clear revenue tracking per project",
    "Less follow-up messages needed",
    "Professional image & branding",
    "One-click outstanding balance check",
    "Historical payment record",
    "No more 'how much do I owe you?'"
  ];

  const clientBenefits = [
    "Total transparency on progress",
    "No surprise invoices at end of month",
    "Clear work status (Pending/Done)",
    "Accountability & Trust",
    "Easy payment history access",
    "Reduced communication friction"
  ];

  return (
    <section className="bg-zinc-950 py-24 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Value for <span className="text-blue-500">Everyone</span>
          </h2>
          <p className="text-zinc-400">
            Flow Log builds trust infrastructure between you and your clients.
          </p>
        </motion.div>

        <div className="flex justify-center mb-12">
          <div className="bg-zinc-900 p-1 rounded-full inline-flex">
            <button 
              onClick={() => setActiveTab("freelancer")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "freelancer" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
            >
              For Freelancers
            </button>
            <button 
              onClick={() => setActiveTab("client")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "client" ? "bg-blue-600 text-white shadow-lg" : "text-zinc-400 hover:text-white"}`}
            >
              For Clients
            </button>
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "freelancer" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "freelancer" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 text-left"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    {activeTab === "freelancer" ? "Focus on your craft, not your math." : "Know exactly what you are paying for."}
                  </h3>
                  <ul className="space-y-4">
                    {(activeTab === "freelancer" ? freelancerBenefits : clientBenefits).map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-zinc-300">
                        <CheckCircle2 className="text-blue-500 shrink-0 w-5 h-5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => navigate("/auth")}
                    className="mt-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium group transition-colors"
                  >
                    {activeTab === "freelancer" ? "Start Freelancing" : "Invite your Freelancer"} 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="hidden md:flex justify-center items-center">
                  <div className={`w-64 h-64 rounded-2xl flex items-center justify-center relative overflow-hidden ${activeTab === "freelancer" ? "bg-blue-500/10" : "bg-emerald-500/10"}`}>
                    <div className={`absolute inset-0 opacity-20 ${activeTab === "freelancer" ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent" : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 to-transparent"}`}></div>
                    <div className="text-6xl">
                      {activeTab === "freelancer" ? "👨‍💻" : "🤝"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
