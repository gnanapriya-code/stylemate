import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaShoppingBag, FaMagic, FaCalendarAlt, FaHeart, 
  FaCloudUploadAlt, FaGem 
} from 'react-icons/fa';
import { HiSparkles, HiArrowRight } from 'react-icons/hi';

const API = "http://localhost:4000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ wardrobeCount: 0, outfitCount: 0, favoriteCount: 0, planCount: 0 });
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    fetchDashboardData();
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening");
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [w, f, p] = await Promise.all([
        axios.get(`${API}/wardrobe?t=${Date.now()}`),
        axios.get(`${API}/favorites?t=${Date.now()}`),
        axios.get(`${API}/plans?t=${Date.now()}`)
      ]);
      const items = Array.isArray(w.data) ? w.data : [];
      const favs = Array.isArray(f.data) ? f.data : [];
      const plans = Array.isArray(p.data) ? p.data : [];
      
      const tops = items.filter(i => i.category === 'tops').length;
      const bottoms = items.filter(i => i.category === 'bottoms').length;
      const dresses = items.filter(i => i.category === 'dresses').length;
      const combos = (tops * bottoms) + dresses;

      setStats({ wardrobeCount: items.length, outfitCount: combos, favoriteCount: favs.length, planCount: plans.length });
    } catch (e) { }
  };

  const widgets = [
    { label: "Total Items", val: stats.wardrobeCount, icon: FaShoppingBag, color: "text-violet-400", bg: "bg-violet-500/20", border: "border-violet-500/30" },
    { label: "Outfit Combos", val: stats.outfitCount, icon: FaGem, color: "text-fuchsia-400", bg: "bg-fuchsia-500/20", border: "border-fuchsia-500/30" },
    { label: "Active Plans", val: stats.planCount, icon: FaCalendarAlt, color: "text-cyan-400", bg: "bg-cyan-500/20", border: "border-cyan-500/30" },
    { label: "Favorites", val: stats.favoriteCount, icon: FaHeart, color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" },
  ];

  return (
    <div className="animate-fade-in space-y-10">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-[2.5rem] glass-card p-10 md:p-14 border border-white/10 group">
        {/* Animated Glow Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-fuchsia-600/30 via-violet-600/30 to-transparent rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-fuchsia-600/40 transition-all duration-1000" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              AI Stylist Active
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            {greeting}, <br/>
            <span className="text-gradient drop-shadow-lg">Fashion Icon.</span>
          </h1>
          
          <p className="text-slate-300 text-lg mb-10 leading-relaxed font-medium max-w-2xl">
            Your digital wardrobe is fully synced. You have <strong className="text-white">{stats.wardrobeCount} items</strong> ready 
            to be transformed into over <strong className="text-fuchsia-400">{stats.outfitCount} unique looks</strong> today.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/recommendations')} className="btn-glam px-8 py-4 flex items-center gap-3 text-lg">
              <FaMagic /> Style Me Now
            </button>
            <button onClick={() => navigate('/wardrobe')} className="px-8 py-4 rounded-xl bg-white/5 border border-white/20 text-white font-bold hover:bg-white/10 transition flex items-center gap-2">
              <FaCloudUploadAlt /> Add Clothes
            </button>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {widgets.map((w, i) => (
          <div key={i} className={`glass-card p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 border ${w.border} group`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${w.bg} ${w.color} shadow-lg transition-transform group-hover:scale-110`}>
                <w.icon size={24} />
              </div>
              {i === 1 && <HiSparkles className="text-yellow-400 text-xl animate-spin-slow" />}
            </div>
            <h3 className="text-5xl font-black text-white mb-1 tracking-tight">{w.val}</h3>
            <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">{w.label}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS ROW */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Action 1 */}
          <div onClick={() => navigate('/wardrobe')} className="group glass-card p-1 cursor-pointer rounded-3xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all">
            <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/5 p-8 rounded-[1.3rem] h-full relative overflow-hidden border border-white/5 group-hover:border-pink-500/30 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg shadow-pink-900/50 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <FaCloudUploadAlt size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Upload</h3>
              <p className="text-slate-400 text-sm">Add new items</p>
              <HiArrowRight className="absolute bottom-8 right-8 text-pink-500 text-2xl group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

          {/* Action 2 */}
          <div onClick={() => navigate('/recommendations')} className="group glass-card p-1 cursor-pointer rounded-3xl hover:shadow-2xl hover:shadow-violet-500/10 transition-all">
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-8 rounded-[1.3rem] h-full relative overflow-hidden border border-white/5 group-hover:border-violet-500/30 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-lg shadow-violet-900/50 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <FaMagic size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Get Styled</h3>
              <p className="text-slate-400 text-sm">AI Suggestions</p>
              <HiArrowRight className="absolute bottom-8 right-8 text-violet-500 text-2xl group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

          {/* Action 3 */}
          <div onClick={() => navigate('/planner')} className="group glass-card p-1 cursor-pointer rounded-3xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-8 rounded-[1.3rem] h-full relative overflow-hidden border border-white/5 group-hover:border-cyan-500/30 transition-colors">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-900/50 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <FaCalendarAlt size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Plan Week</h3>
              <p className="text-slate-400 text-sm">Organize outfits</p>
              <HiArrowRight className="absolute bottom-8 right-8 text-cyan-500 text-2xl group-hover:translate-x-2 transition-transform" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}