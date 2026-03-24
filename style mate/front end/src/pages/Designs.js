import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  FaPaperPlane, FaMagic, FaSave, FaDownload, 
  FaRedo, FaShareAlt, FaRobot 
} from "react-icons/fa";
import { GiSewingNeedle, GiNecklace } from "react-icons/gi";

// CONFIG
const API = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export default function Designs() {
  // State
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: "Hello! I am your personal AI Couture Designer. Describe your dream outfit, and I will create it for you." }
  ]);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  
  const chatEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Load saved designs
  useEffect(() => {
    fetchSavedDesigns();
  }, []);

  async function fetchSavedDesigns() {
    try {
      const res = await axios.get(`${API}/designs`);
      setSavedDesigns(res.data || []);
    } catch (e) {
      console.error("Failed to load designs");
    }
  }

  // Upload image
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${API}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const url = res.data.file_url;
      setUploadedImage(url);
      setChatHistory(prev => [...prev, { sender: "user", text: `📸 Uploaded: ${file.name}` }]);
    } catch (e) {
      console.error("Upload failed", e);
      alert("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // AI generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = { sender: "user", text: prompt };
    setChatHistory((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsGenerating(true);

    const baseContext = uploadedImage ? `source image: ${uploadedImage}, ` : "";
    const enhancedPrompt = `fashion design sketch, high quality, realistic, ${baseContext}${userMsg.text}, 4k, trending on artstation`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=800&height=1200&nologo=true`;

    setTimeout(() => {
      const accessories = suggestAccessories(userMsg.text);
      const aiResponse = { 
        sender: "ai", 
        text: `✨ Design created! Stylist tip: ${accessories}` 
      };
      setChatHistory((prev) => [...prev, aiResponse]);
      setCurrentDesign({
        imageUrl: imageUrl,
        prompt: userMsg.text,
        sourceImage: uploadedImage || null,
        accessories: accessories,
        date: new Date()
      });
      setIsGenerating(false);
    }, 2500);
  };

  const suggestAccessories = (text) => {
    const t = text.toLowerCase();
    if (t.includes("gown") || t.includes("formal")) return "Pair with diamond earrings and silver clutch.";
    if (t.includes("summer") || t.includes("floral")) return "A straw hat and gold bangles would be perfect.";
    if (t.includes("business") || t.includes("suit")) return "Add a leather tote and classic watch.";
    if (t.includes("party")) return "Go bold with statement hoops and metallic heels.";
    return "Complete with a matching handbag and subtle jewelry.";
  };

  const handleSaveDesign = async () => {
    if (!currentDesign) return;
    try {
      await axios.post(`${API}/designs`, currentDesign);
      alert("Design saved!");
      fetchSavedDesigns();
    } catch (e) {
      alert("Could not save design.");
    }
  };

  const clearUploadedImage = () => setUploadedImage(null);

  const handleGetRecommendations = async () => {
    if (!uploadedImage) {
      alert("Please upload an image first");
      return;
    }
    setIsLoadingRecommendations(true);
    try {
      const res = await axios.post(`${API}/recommendations`, {
        image_path: uploadedImage
      });
      setRecommendations(res.data || []);
      setChatHistory(prev => [...prev, { 
        sender: "ai", 
        text: `🎯 Found ${res.data.length} similar outfits from Polyvore!` 
      }]);
    } catch (e) {
      console.error("Recommendation error:", e);
      setChatHistory(prev => [...prev, { 
        sender: "ai", 
        text: "Recommendation engine is training. Try again soon!" 
      }]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleDownload = () => {
    if (!currentDesign) return;
    const link = document.createElement("a");
    link.href = currentDesign.imageUrl;
    link.download = `design-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col lg:flex-row overflow-hidden">
      
      {/* LEFT: CHAT */}
      <div className="lg:w-1/3 w-full flex flex-col border-r border-stone-200 bg-white h-screen">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-white z-10">
          <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <FaRobot className="text-purple-600" /> AI Designer
          </h2>
          <p className="text-stone-500 text-sm">Describe your imagination.</p>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                  msg.sender === "user" 
                    ? "bg-stone-800 text-white" 
                    : "bg-white text-stone-700 border border-stone-100"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border border-stone-100">
                <span className="text-xs text-stone-400">✨ Creating design...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-stone-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => document.getElementById('file-input')?.click()}
                className="px-3 py-2 bg-stone-900 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 text-sm"
              >
                {isUploading ? "Uploading..." : "📸 Upload"}
              </button>
              {uploadedImage && (
                <>
                  <button
                    type="button"
                    onClick={handleGetRecommendations}
                    disabled={isLoadingRecommendations}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                  >
                    {isLoadingRecommendations ? "..." : "🔍 Similar"}
                  </button>
                  <button
                    type="button"
                    onClick={clearUploadedImage}
                    className="px-2 py-2 bg-red-500 text-white rounded text-sm"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
            {uploadedImage && (
              <img src={uploadedImage} alt="preview" className="w-16 h-16 object-cover rounded border" />
            )}
            <form onSubmit={handleGenerate} className="relative">
              <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your design..." 
                className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button 
                type="submit" 
                disabled={isGenerating}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-stone-900 text-white rounded disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT: DESIGN CANVAS */}
      <div className="lg:w-2/3 w-full bg-stone-100 p-8 flex flex-col h-screen overflow-y-auto">
        
        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
          {currentDesign ? (
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="h-[600px] w-full bg-stone-200 relative overflow-hidden">
                  <img 
                    src={currentDesign.imageUrl} 
                    alt="Design" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/800x1200"; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex gap-2">
                     <button onClick={handleSaveDesign} className="text-white text-sm hover:opacity-75">
                        <FaSave /> Save
                     </button>
                     <button onClick={handleDownload} className="text-white text-sm hover:opacity-75">
                        <FaDownload /> Download
                     </button>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <p className="text-sm text-stone-600"><strong>Tip:</strong> {currentDesign.accessories}</p>
                </div>
              </div>
              {recommendations.length > 0 && (
                <div className="mt-6 bg-white p-4 rounded-xl">
                  <h4 className="font-bold text-sm mb-3">Similar Styles</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {recommendations.slice(0, 5).map((rec, i) => (
                      <div key={i} className="aspect-square bg-stone-200 rounded text-xs text-center flex items-center justify-center">
                        <span className="text-stone-500">{(rec.similarity_score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center opacity-40">
               <GiSewingNeedle className="text-6xl mx-auto mb-4" />
               <h3 className="text-3xl font-serif font-bold">Design Studio</h3>
               <p className="text-stone-500 mt-2">Start with a prompt.</p>
            </div>
          )}
        </div>

        {/* Saved Designs */}
        {savedDesigns.length > 0 && (
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h4 className="text-sm font-bold text-stone-400 mb-3">Saved</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {savedDesigns.map((design) => (
                <div 
                  key={design.id} 
                  onClick={() => setCurrentDesign(design)}
                  className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden border hover:border-purple-500 cursor-pointer"
                >
                  <img src={design.imageUrl} alt="saved" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
