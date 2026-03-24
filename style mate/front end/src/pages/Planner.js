import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCalendarAlt, FaMagic, FaPlus, FaTrash, FaCheckCircle, 
  FaArrowLeft, FaRegCalendarCheck 
} from 'react-icons/fa';
import { GiHanger, GiCalendar } from 'react-icons/gi';

const API = "http://localhost:4000/api";

export default function Planner() {
  const [view, setView] = useState("list"); // 'list' or 'create'
  const [plans, setPlans] = useState([]);
  const [items, setItems] = useState([]);
  
  // Creation State
  const [planDuration, setPlanDuration] = useState(7);
  const [generatedPreview, setGeneratedPreview] = useState([]);
  const [maxCombos, setMaxCombos] = useState(0);

  useEffect(() => {
    fetchPlans();
    fetchWardrobe();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${API}/plans`);
      setPlans(res.data || []);
    } catch(e) {}
  };

  const fetchWardrobe = async () => {
    try {
      const res = await axios.get(`${API}/wardrobe`);
      const wardrobeItems = res.data || [];
      setItems(wardrobeItems);
      
      // Calculate combos
      const tops = wardrobeItems.filter(i => i.category === 'tops').length;
      const bottoms = wardrobeItems.filter(i => i.category === 'bottoms').length;
      const dresses = wardrobeItems.filter(i => i.category === 'dresses').length;
      setMaxCombos((tops * bottoms) + dresses);
    } catch(e) {}
  };

  const generateSchedule = () => {
    const tops = items.filter(i => i.category === 'tops');
    const bottoms = items.filter(i => i.category === 'bottoms');
    const dresses = items.filter(i => i.category === 'dresses');
    
    let allOutfits = [];
    dresses.forEach(d => allOutfits.push({ type: 'Dress', items: [d] }));
    tops.forEach(t => bottoms.forEach(b => allOutfits.push({ type: 'Combo', items: [t, b] })));

    // Shuffle
    allOutfits.sort(() => Math.random() - 0.5);

    // Slice
    const days = Math.min(planDuration, allOutfits.length);
    const schedule = allOutfits.slice(0, days).map((outfit, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            date: date.toDateString(),
            day: i + 1,
            outfit
        };
    });
    setGeneratedPreview(schedule);
  };

  const savePlan = async () => {
    if (generatedPreview.length === 0) return;
    try {
        const newPlan = {
            name: `${planDuration}-Day Outfit Plan`,
            duration: generatedPreview.length,
            schedule: generatedPreview
        };
        await axios.post(`${API}/plans`, newPlan);
        alert("Plan Saved Successfully!");
        setGeneratedPreview([]);
        setView("list");
        fetchPlans();
    } catch(e) {
        alert("Error saving plan");
    }
  };

  const deletePlan = async (id) => {
      if(!window.confirm("Delete this plan?")) return;
      await axios.delete(`${API}/plans/${id}`);
      fetchPlans();
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Outfit Planner
          </h1>
          <p className="text-gray-500 mt-1">Organize your week with AI.</p>
        </div>
        
        {view === "list" && (
            <button 
                onClick={() => setView("create")}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center gap-2"
            >
                <FaPlus /> Create New Plan
            </button>
        )}
      </div>

      {/* --- VIEW: LIST PLANS --- */}
      {view === "list" && (
        <>
            {plans.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <GiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No Active Plans</h3>
                    <p className="text-gray-400 mb-6">Create a plan to stop worrying about what to wear.</p>
                    <button onClick={() => setView("create")} className="text-blue-500 font-bold hover:underline">Start Planning</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><FaRegCalendarCheck size={20} /></div>
                                <button onClick={() => deletePlan(plan.id)} className="text-gray-300 hover:text-red-500"><FaTrash /></button>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                            <p className="text-gray-500 text-sm mb-4">Duration: {plan.duration} Days</p>
                            
                            {/* Preview Grid */}
                            <div className="flex gap-1 overflow-hidden rounded-lg h-16 bg-gray-50 mb-4">
                                {plan.schedule.slice(0,5).map((day, i) => (
                                    <div key={i} className="flex-1 border-r border-white">
                                        <img src={day.outfit.items[0].image_url} className="w-full h-full object-cover" alt="prev" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-green-600 font-bold bg-green-50 inline-block px-2 py-1 rounded">Active</div>
                        </div>
                    ))}
                </div>
            )}
        </>
      )}

      {/* --- VIEW: CREATE PLAN --- */}
      {view === "create" && (
        <div className="space-y-8">
            {/* Controls */}
            <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
                <button onClick={() => setView("list")} className="p-3 bg-gray-100 rounded-full hover:bg-gray-200"><FaArrowLeft /></button>
                
                <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-700">Duration:</span>
                    <select 
                        value={planDuration} 
                        onChange={(e) => setPlanDuration(Number(e.target.value))}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 font-bold focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                        <option value={7}>1 Week (7 Days)</option>
                        <option value={14}>2 Weeks (14 Days)</option>
                        <option value={30}>1 Month (30 Days)</option>
                    </select>
                </div>

                <div className="flex-1 text-sm text-gray-500 text-center md:text-left">
                    Max unique outfits available: <strong>{maxCombos}</strong>
                </div>

                <button 
                    onClick={generateSchedule}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <FaMagic /> Generate Preview
                </button>
            </div>

            {/* Preview Grid */}
            {generatedPreview.length > 0 && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Preview: {generatedPreview.length} Days</h3>
                        <button onClick={savePlan} className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-600 flex items-center gap-2">
                            <FaCheckCircle /> Save Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {generatedPreview.map((day) => (
                            <div key={day.day} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                                <div className="bg-gray-50 p-3 border-b border-gray-100 font-bold text-gray-600 text-sm flex justify-between">
                                    <span>Day {day.day}</span>
                                    <span className="text-xs font-normal text-gray-400">{day.date}</span>
                                </div>
                                <div className="h-48 flex">
                                    {day.outfit.items.map((it, i) => (
                                        <img key={i} src={it.image_url} className="flex-1 h-full object-cover border-r border-white" alt="cloth" />
                                    ))}
                                </div>
                                <div className="p-3">
                                    <p className="text-xs font-bold text-gray-800 truncate">
                                        {day.outfit.items.map(i => i.item_name).join(" + ")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

    </div>
  );
}