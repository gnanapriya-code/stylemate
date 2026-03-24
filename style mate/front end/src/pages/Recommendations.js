import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaArrowLeft, FaMagic, FaHeart, FaRedo, FaInfoCircle, FaCalendarDay, FaLightbulb
} from 'react-icons/fa';
import { 
  GiPartyPopper, GiTie, GiCoffeeCup, GiLipstick, 
  GiBriefcase, GiRunningShoe, GiHanger, GiNecklace, GiWatch, GiSunglasses
} from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';

const API = "http://localhost:4000/api"; 

export default function Recommendations() {
  const [items, setItems] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessoryTip, setAccessoryTip] = useState("");
  const navigate = useNavigate();

  // --- 1. Fetch User Wardrobe ---
  useEffect(() => {
    fetchUserWardrobe();
  }, []);

  async function fetchUserWardrobe() {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/wardrobe`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setItems([]); 
    } finally {
      setLoading(false);
    }
  }

  // --- 2. LOGIC HELPERS ---

  // Detect Real World Season
  const getCurrentSeason = () => {
    const month = new Date().getMonth(); // 0-11
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };

  const getSeasonalAdvice = () => {
    const season = getCurrentSeason();
    switch (season) {
        case 'spring': return "🌸 Spring Season: Weather is unpredictable! Key fabrics are Cotton & Linen. Try pastel tones like lavender or peach. Layer with a lightweight trench coat.";
        case 'summer': return "☀️ Summer Season: Stay cool! Best fabrics are Linen & Silk. Wear white or bright colors to reflect sunlight. Don't forget sunglasses and open sandals.";
        case 'fall': return "🍂 Autumn Season: Embrace earthy tones like rust and mustard. Flannel and Corduroy are great. Layer with denim jackets or shawls.";
        case 'winter': return "❄️ Winter Season: Stay warm! Essential fabrics are Wool & Fleece. Dark colors absorb heat. Wear turtlenecks, heavy coats, and boots.";
        default: return "";
    }
  };

  const generateAccessoryTip = (style) => {
    const s = (style || "casual").toLowerCase();
    if (s.includes("party")) return "✨ Accessory Tip: Go bold! Statement earrings, a metallic clutch, and high heels will elevate this look.";
    if (s.includes("formal") || s.includes("business")) return "✨ Accessory Tip: Keep it minimal. A classic watch, stud earrings, and a structured handbag are perfect.";
    if (s.includes("sporty")) return "✨ Accessory Tip: A baseball cap, smartwatch, and a sporty backpack fit this vibe perfectly.";
    if (s.includes("ethnic") || s.includes("romantic")) return "✨ Accessory Tip: Jhumkas or drop earrings work wonders. Add a few bangles to complete the style.";
    return "✨ Accessory Tip: A simple pendant necklace and comfortable sneakers or loafers would look great.";
  };

  // --- 3. OUTFIT ENGINE ---
  const generateOutfits = (type, value) => {
    let filtered = items;
    
    // Filter by Occasion (Removed Season filtering as requested)
    if (type !== 'random') {
        filtered = items.filter(i => {
            const style = (i.style || 'casual').toLowerCase();
            const target = value.toLowerCase();
            if (type === 'occasion') return style.includes(target);
            return true;
        });
    }

    const tops = filtered.filter(i => i.category === 'tops');
    const bottoms = filtered.filter(i => i.category === 'bottoms');
    const dresses = filtered.filter(i => i.category === 'dresses');
    const outerwear = filtered.filter(i => i.category === 'outerwear');

    let combos = [];

    // Dresses
    dresses.forEach(d => combos.push({ type: 'dress', id: d.id, items: [d] }));

    // Tops + Bottoms
    if (tops.length > 0 && bottoms.length > 0) {
        tops.forEach(t => {
            bottoms.forEach(b => {
                combos.push({ type: 'combo', id: `${t.id}-${b.id}`, items: [t, b] });
            });
        });
    }

    // Add Outerwear if it's Winter/Fall (Real world check)
    const currentSeason = getCurrentSeason();
    if ((currentSeason === 'winter' || currentSeason === 'fall') && outerwear.length > 0) {
        const layered = [];
        combos.forEach(c => {
            outerwear.forEach(coat => {
                layered.push({ 
                    type: 'layered', 
                    id: `${c.id}-${coat.id}`, 
                    items: [...c.items, coat] 
                });
            });
        });
        combos = [...layered, ...combos]; // Add layered options
    }

    if (combos.length === 0) {
       alert(`No outfits found for ${value}. Try adding more items!`);
       return;
    }

    // Shuffle & Set
    combos.sort(() => Math.random() - 0.5);
    setGeneratedOutfits(combos);
    setCurrentOutfitIndex(0);
    
    // Set Tips based on first outfit's style (or the selected occasion)
    const styleContext = value === 'all' ? (combos[0].items[0].style || 'casual') : value;
    setAccessoryTip(generateAccessoryTip(styleContext));
    
    setActiveSession({ type, value, label: type === 'random' ? 'Surprise Me' : value });
  };

  const currentOutfit = generatedOutfits[currentOutfitIndex];

  // Update tip when outfit changes
  useEffect(() => {
    if (currentOutfit) {
        const style = currentOutfit.items[0].style || 'casual';
        setAccessoryTip(generateAccessoryTip(style));
    }
  }, [currentOutfitIndex, currentOutfit]);

  const handleAddToFavorites = async () => {
    if (!currentOutfit) return;
    try {
        await axios.post(`${API}/favorites`, currentOutfit);
        alert("❤️ Saved to Favorites!");
    } catch (err) { alert("Could not save."); }
  };

  const occasions = [
    { name: 'casual', icon: GiCoffeeCup, color: 'bg-green-100 text-green-600', label: 'Casual' },
    { name: 'formal', icon: GiTie, color: 'bg-slate-100 text-slate-700', label: 'Formal' },
    { name: 'party', icon: GiPartyPopper, color: 'bg-purple-100 text-purple-600', label: 'Party' },
    { name: 'business', icon: GiBriefcase, color: 'bg-blue-100 text-blue-700', label: 'Business' },
    { name: 'sporty', icon: GiRunningShoe, color: 'bg-red-100 text-red-600', label: 'Sporty' },
    { name: 'romantic', icon: GiLipstick, color: 'bg-pink-100 text-pink-600', label: 'Romantic' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in pb-20">
      
      {/* HEADER */}
      {!activeSession ? (
        <div className="mb-10">
           <h1 className="text-4xl font-extrabold text-gray-800 flex items-center gap-3">
             <FaMagic className="text-purple-600" /> Outfit Ideas
           </h1>
           <p className="text-gray-500 mt-2">
             Smart styling based on <strong>{items.length} items</strong> in your wardrobe.
           </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => { setActiveSession(null); setGeneratedOutfits([]); }} className="bg-white border p-3 rounded-full hover:bg-gray-100"><FaArrowLeft /></button>
           <div>
             <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeSession.label}</h2>
             <p className="text-sm text-gray-500">{generatedOutfits.length} Options Found</p>
           </div>
        </div>
      )}

      {/* SELECTION MENU (No Seasons, just Occasions) */}
      {!activeSession && (
        <div className="space-y-10">
            {/* Surprise Me */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold">Quick Mix</h3>
                    <p>Shuffle your personal collection.</p>
                </div>
                <button onClick={() => generateOutfits('random', 'all')} className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold shadow hover:scale-105 transition">Surprise Me</button>
            </div>

            {/* Occasions Grid */}
            <section>
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><GiHanger/> Shop by Occasion</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {occasions.map(occ => (
                        <div key={occ.name} onClick={() => generateOutfits('occasion', occ.name)} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center cursor-pointer border hover:shadow-md hover:-translate-y-1 transition">
                            <div className={`p-3 rounded-full mb-2 ${occ.color}`}><occ.icon /></div>
                            <span className="text-sm font-bold text-gray-700">{occ.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Current Season Advice Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><FaCalendarDay size={24} /></div>
                    <div>
                        <h4 className="text-lg font-bold text-blue-800 mb-1">Seasonal Advice</h4>
                        <p className="text-blue-700 text-sm leading-relaxed font-medium">
                            {getSeasonalAdvice()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* RESULTS DISPLAY */}
      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Card */}
            <div className="lg:col-span-2">
                {generatedOutfits.length > 0 ? (
                    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col min-h-[500px]">
                        <div className="p-6 flex justify-between items-center bg-gray-50/50">
                            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Match {currentOutfitIndex + 1} / {generatedOutfits.length}</span>
                            <button onClick={handleAddToFavorites} className="p-3 bg-white rounded-full shadow hover:text-red-500 transition"><FaHeart /></button>
                        </div>
                        
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 gap-4">
                            {currentOutfit.items.map((item, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="w-56 h-72 rounded-3xl overflow-hidden shadow-lg bg-gray-100">
                                        <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-center mt-2">
                                        <p className="font-bold text-sm text-gray-800 truncate w-56">{item.item_name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                                    </div>
                                    {idx < currentOutfit.items.length - 1 && <div className="hidden md:block absolute -right-6 top-1/2 text-2xl text-gray-300 font-light">+</div>}
                                </div>
                            ))}
                        </div>

                        {/* ACCESSORY TIPS (Dynamic) */}
                        <div className="mx-8 mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 flex items-start gap-3 shadow-sm">
                            <FaLightbulb className="text-yellow-500 text-xl flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-1">Stylist Tip</h4>
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">{accessoryTip}</p>
                            </div>
                        </div>

                        <div className="p-8 flex justify-center border-t border-gray-50">
                             <button onClick={() => setCurrentOutfitIndex((p) => (p + 1) % generatedOutfits.length)} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition">
                                <FaRedo /> Next Look
                             </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
                        <GiHanger className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No Matches Found</h3>
                        <p className="text-gray-500 mb-6">No items matched the strict rules for <strong>{activeSession.value}</strong>.</p>
                        <button onClick={() => navigate('/wardrobe')} className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold">Add Clothes</button>
                    </div>
                )}
            </div>

            {/* Sidebar List */}
            <div className="lg:col-span-1">
                <h3 className="font-bold text-gray-800 mb-4">Other Combinations</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {generatedOutfits.map((outfit, idx) => (
                        <div key={idx} onClick={() => setCurrentOutfitIndex(idx)} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer border hover:bg-gray-50 ${currentOutfitIndex === idx ? 'border-purple-400 bg-purple-50' : 'border-gray-100 bg-white'}`}>
                           <div className="flex -space-x-2">
                               {outfit.items.slice(0,3).map((it, i) => (
                                   <img key={i} src={it.image_url} className="w-10 h-10 rounded-full border-2 border-white object-cover bg-gray-200" alt="t" />
                               ))}
                           </div>
                           <div>
                               <p className="text-sm font-bold">Option {idx + 1}</p>
                               <p className="text-xs text-green-600 font-bold">Items: {outfit.items.length}</p>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}