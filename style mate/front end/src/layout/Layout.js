import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { 
  FaHome, FaTshirt, FaMagic, FaCalendarAlt, FaHeart, 
  FaSignOutAlt, FaPencilRuler, FaGem 
} from "react-icons/fa";

export default function Layout() {
  const navClass = ({ isActive }) => 
    `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium text-sm tracking-wide ${
      isActive 
        ? "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 shadow-sm border border-rose-100" 
        : "text-slate-500 hover:bg-white/80 hover:text-slate-900"
    }`;

  return (
    <div className="min-h-screen flex font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* --- SIDEBAR (Light Glass) --- */}
      <aside className="w-72 glass-sidebar fixed h-full z-50 flex flex-col justify-between hidden md:flex">
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <FaGem size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-600">
                StyleMate
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-0.5">Fashion AI</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavLink to="/" className={navClass}>
              <FaHome size={16} /> Dashboard
            </NavLink>
            <NavLink to="/wardrobe" className={navClass}>
              <FaTshirt size={16} /> My Wardrobe
            </NavLink>
            <NavLink to="/recommendations" className={navClass}>
              <FaMagic size={16} /> Outfit Ideas
            </NavLink>
            <NavLink to="/planner" className={navClass}>
              <FaCalendarAlt size={16} /> Planner
            </NavLink>
            <NavLink to="/designs" className={navClass}>
              <FaPencilRuler size={16} /> Design Studio
            </NavLink>
            <NavLink to="/favorites" className={navClass}>
              <FaHeart size={16} /> Favorites
            </NavLink>
          </nav>
        </div>

        {/* User / Logout */}
        <div className="p-8">
          <div className="p-4 rounded-2xl bg-white/50 border border-white mb-4 shadow-sm">
             <p className="text-xs text-slate-400 font-bold uppercase mb-1">Signed In</p>
             <p className="text-sm font-bold text-slate-800">Fashionista User</p>
          </div>
          <button className="w-full flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all font-semibold text-sm">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}