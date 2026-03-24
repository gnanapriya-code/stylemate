import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaCamera, FaTshirt, FaMagic, FaUpload, FaUser } from 'react-icons/fa';
import { GiSkirt } from 'react-icons/gi';

const API = "http://localhost:4000/api";

export default function Avatar() {
  const [profile, setProfile] = useState({ faceUrl: null, bodyUrl: null });
  const [wardrobe, setWardrobe] = useState([]);
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputFace = useRef(null);
  const fileInputBody = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchWardrobe();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/avatar`);
      if (res.data.bodyUrl) setProfile(res.data);
    } catch(e) {}
  };

  const fetchWardrobe = async () => {
    try {
      const res = await axios.get(`${API}/wardrobe`);
      setWardrobe(res.data || []);
    } catch(e) {}
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      // 1. Upload Image
      const uploadRes = await axios.post(`${API}/upload`, fd);
      const url = uploadRes.data.file_url;

      // 2. Update Profile State
      const newProfile = { ...profile, [type === 'face' ? 'faceUrl' : 'bodyUrl']: url };
      setProfile(newProfile);

      // 3. Save to Backend
      await axios.post(`${API}/avatar`, newProfile);
    } catch (err) {
      alert("Upload failed.");
    }
  };

  const handleTryOn = () => {
    if (!profile.bodyUrl) return alert("Please upload a full-body picture first!");
    if (!selectedTop && !selectedBottom) return alert("Select at least one item to try on.");

    setIsProcessing(true);
    // Simulate AI Processing time
    setTimeout(() => {
      setIsProcessing(false);
    }, 1500);
  };

  // Filter items
  const tops = wardrobe.filter(i => i.category === 'tops' || i.category === 'outerwear' || i.category === 'dresses');
  const bottoms = wardrobe.filter(i => i.category === 'bottoms');

  return (
    <div className="min-h-screen bg-stone-50 p-4 lg:p-8 animate-fade-in flex flex-col lg:flex-row gap-8">
      
      {/* --- LEFT: CONTROLS & WARDROBE --- */}
      <div className="lg:w-1/3 flex flex-col gap-6 h-full">
        
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaUser className="text-purple-600" /> Your Avatar
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Face Upload */}
            <div 
              onClick={() => fileInputFace.current.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative overflow-hidden"
            >
              {profile.faceUrl ? (
                <img src={profile.faceUrl} alt="Face" className="w-full h-full object-cover" />
              ) : (
                <>
                  <FaUser className="text-2xl text-gray-300 mb-2" />
                  <span className="text-xs font-bold text-gray-400">Upload Face</span>
                </>
              )}
              <input ref={fileInputFace} type="file" hidden onChange={(e) => handleUpload(e, 'face')} />
            </div>

            {/* Body Upload */}
            <div 
              onClick={() => fileInputBody.current.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition relative overflow-hidden"
            >
              {profile.bodyUrl ? (
                <img src={profile.bodyUrl} alt="Body" className="w-full h-full object-cover" />
              ) : (
                <>
                  <FaUpload className="text-2xl text-gray-300 mb-2" />
                  <span className="text-xs font-bold text-gray-400">Full Body</span>
                </>
              )}
              <input ref={fileInputBody} type="file" hidden onChange={(e) => handleUpload(e, 'body')} />
            </div>
          </div>
        </div>

        {/* Wardrobe Selector */}
        <div className="flex-1 bg-white p-6 rounded-3xl shadow-lg border border-stone-100 flex flex-col min-h-[400px]">
          <h3 className="font-bold text-gray-700 mb-4">Select Items to Try</h3>
          
          {/* Tops List */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Tops / Dresses</p>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              <button 
                 onClick={() => setSelectedTop(null)}
                 className={`w-16 h-16 rounded-xl border flex-shrink-0 flex items-center justify-center ${selectedTop === null ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              >
                <span className="text-xs text-red-400">None</span>
              </button>
              {tops.map(item => (
                <img 
                  key={item.id} 
                  src={item.image_url} 
                  alt="Top" 
                  onClick={() => setSelectedTop(item)}
                  className={`w-16 h-16 rounded-xl border-2 object-cover flex-shrink-0 cursor-pointer ${selectedTop?.id === item.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>

          {/* Bottoms List */}
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase mb-2">Bottoms</p>
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              <button 
                 onClick={() => setSelectedBottom(null)}
                 className={`w-16 h-16 rounded-xl border flex-shrink-0 flex items-center justify-center ${selectedBottom === null ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              >
                <span className="text-xs text-red-400">None</span>
              </button>
              {bottoms.map(item => (
                <img 
                  key={item.id} 
                  src={item.image_url} 
                  alt="Btm" 
                  onClick={() => setSelectedBottom(item)}
                  className={`w-16 h-16 rounded-xl border-2 object-cover flex-shrink-0 cursor-pointer ${selectedBottom?.id === item.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={handleTryOn}
            disabled={isProcessing}
            className="mt-auto w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? "Processing..." : <><FaMagic /> Try On Now</>}
          </button>
        </div>
      </div>

      {/* --- RIGHT: VIRTUAL MIRROR --- */}
      <div className="lg:w-2/3 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col items-center justify-center border border-stone-200 min-h-[600px]">
        
        {profile.bodyUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-stone-100">
            {/* Base User Image */}
            <img 
              src={profile.bodyUrl} 
              alt="User Body" 
              className="max-h-[85vh] w-auto object-contain z-0 mix-blend-multiply" 
            />

            {/* OVERLAY: CLOTHING LAYERS (Simulated AI Fit) */}
            {/* The logic here uses absolute positioning to 'overlay' clothes. 
                In a real VTON, this would be a single generated image. 
                Here, we simulate it by placing PNGs over the body. */}
            
            {/* Top Layer */}
            {selectedTop && !isProcessing && (
              <div className="absolute top-[28%] w-[35%] z-20 transition-all duration-500 animate-fade-in pointer-events-none">
                 <img src={selectedTop.image_url} className="w-full drop-shadow-2xl" alt="Top Overlay" />
              </div>
            )}

            {/* Bottom Layer */}
            {selectedBottom && !isProcessing && (
              <div className="absolute top-[55%] w-[32%] z-10 transition-all duration-500 animate-fade-in pointer-events-none">
                 <img src={selectedBottom.image_url} className="w-full drop-shadow-2xl" alt="Bottom Overlay" />
              </div>
            )}

            {/* Loading Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-purple-600 font-bold animate-pulse">AI is fitting your outfit...</p>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center opacity-40 p-10">
            <FaCamera className="text-8xl text-stone-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-stone-400">Virtual Mirror</h3>
            <p>Upload your full-body picture to start trying on clothes.</p>
          </div>
        )}

      </div>
    </div>
  );
}