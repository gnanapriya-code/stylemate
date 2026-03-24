import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs"; 
import { 
  FaTrash, FaCloudUploadAlt, FaTshirt, FaMagic, 
  FaTimes, FaCheck, FaSpinner, FaPlus, FaFilter 
} from "react-icons/fa";
import { 
  GiSkirt, GiDress, GiRunningShoe, GiSchoolBag, GiCape, GiTrousers, GiHanger 
} from "react-icons/gi";

const API = "http://localhost:4000/api";

// --- ADVANCED CLASSIFIER ENGINE ---
const analyzeClothing = async (imgElement, model, filename) => {
  // 1. Get Predictions
  const predictions = await model.classify(imgElement);
  const labels = predictions.map(p => p.className.toLowerCase()).join(" ");
  
  // 2. Shape Analysis
  const ratio = imgElement.width / imgElement.height;
  const isTall = ratio < 0.8; 
  
  const lowerName = filename.toLowerCase();
  
  // LOGIC TREE
  let category = "tops";
  let style = "casual";

  // A. Filename Override (Highest Priority)
  if (lowerName.includes("pant") || lowerName.includes("jean") || lowerName.includes("trouser") || lowerName.includes("legging")) return { category: "bottoms", style: "casual" };
  if (lowerName.includes("skirt")) return { category: "bottoms", style: "casual" };
  if (lowerName.includes("dress") || lowerName.includes("gown") || lowerName.includes("frock") || lowerName.includes("kurti") || lowerName.includes("saree")) return { category: "dresses", style: "ethnic" };
  if (lowerName.includes("blazer") || lowerName.includes("coat") || lowerName.includes("jacket")) return { category: "outerwear", style: "formal" };

  // B. Visual Analysis
  if (labels.includes("jean") || labels.includes("pant") || labels.includes("trouser")) {
    category = "bottoms";
  } else if (labels.includes("gown") || labels.includes("dress") || labels.includes("robe") || labels.includes("kimono")) {
    category = "dresses";
    style = "formal";
  } else if (labels.includes("shoe") || labels.includes("sneaker") || labels.includes("boot")) {
    category = "shoes";
  } else if (labels.includes("bag") || labels.includes("purse")) {
    category = "accessories";
  } else if (labels.includes("suit") || labels.includes("tuxedo")) {
    category = "tops";
    style = "formal";
  } else if (isTall) {
    // If it's tall and not explicitly a top, it's likely bottoms or a dress
    if (labels.includes("velvet") || labels.includes("curtain")) category = "dresses"; // AI often mistakes dresses for curtains
    else category = "bottoms";
  }

  // C. Kurti/Ethnic Logic
  if (category === "tops" && isTall) {
     // Long tops are often Kurtis or Dresses
     category = "dresses";
     style = "ethnic";
  }

  return { category, style };
};

export default function Wardrobe() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  // Upload State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processingFiles, setProcessingFiles] = useState([]); // { file, status, preview, data: { category, style } }
  const fileInputRef = useRef();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/wardrobe?t=${Date.now()}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) { setItems([]); } 
    finally { setLoading(false); }
  };

  // --- 1. HANDLE FILE SELECTION ---
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Initialize processing state
    const newFiles = files.map(file => ({
      file,
      status: 'pending', // pending -> uploading -> analyzing -> ready
      preview: URL.createObjectURL(file),
      data: { category: 'tops', style: 'casual' } // default
    }));

    setProcessingFiles(newFiles);
    setIsModalOpen(true);
    processQueue(newFiles);
    
    e.target.value = ""; // Reset input
  };

  // --- 2. PROCESS QUEUE (Upload & AI) ---
  const processQueue = async (filesToProcess) => {
    const model = await mobilenet.load();

    const updatedQueue = [...filesToProcess];

    for (let i = 0; i < updatedQueue.length; i++) {
      const current = updatedQueue[i];
      
      // Update Status: Uploading
      updateFileStatus(i, { status: 'uploading' });

      try {
        // A. Upload
        const fd = new FormData();
        fd.append("file", current.file);
        const res = await axios.post(`${API}/upload`, fd);
        const url = res.data.file_url;

        // Update Status: Analyzing
        updateFileStatus(i, { status: 'analyzing', url });

        // B. Analyze
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        await new Promise(r => img.onload = r);

        const { category, style } = await analyzeClothing(img, model, current.file.name);

        // Update Status: Ready
        updateFileStatus(i, { 
          status: 'ready', 
          data: { category, style, item_name: current.file.name.split('.')[0] } 
        });

      } catch (err) {
        console.error(err);
        updateFileStatus(i, { status: 'error' });
      }
    }
  };

  const updateFileStatus = (index, updates) => {
    setProcessingFiles(prev => prev.map((item, idx) => 
      idx === index ? { ...item, ...updates } : item
    ));
  };

  // --- 3. SAVE FINALIZED ITEMS ---
  const handleSaveAll = async () => {
    const readyFiles = processingFiles.filter(f => f.status === 'ready');
    if (readyFiles.length === 0) return;

    const newItems = readyFiles.map(f => ({
      item_name: f.data.item_name,
      category: f.data.category,
      style: f.data.style,
      color: "unknown",
      season: ["all"],
      image_url: f.url
    }));

    try {
      await axios.post(`${API}/wardrobe/batch`, newItems);
      setIsModalOpen(false);
      setProcessingFiles([]);
      fetchItems();
      alert(`✅ Saved ${newItems.length} items to your wardrobe!`);
    } catch (err) {
      alert("Error saving items.");
    }
  };

  // --- UI HELPERS ---
  const handleDelete = async (id) => {
    if(!window.confirm("Delete item?")) return;
    await axios.delete(`${API}/wardrobe/${id}`);
    fetchItems();
  };

  const handleClearAll = async () => {
    if(!window.confirm("Reset entire wardrobe?")) return;
    await axios.delete(`${API}/wardrobe/clear`);
    setItems([]);
  };

  const filteredItems = activeTab === "all" ? items : items.filter(i => i.category === activeTab);

  const tabs = [
    { id: "all", label: "All", icon: FaTshirt },
    { id: "tops", label: "Tops", icon: FaTshirt },
    { id: "bottoms", label: "Bottoms", icon: GiTrousers },
    { id: "dresses", label: "Dresses", icon: GiDress },
    { id: "outerwear", label: "Outerwear", icon: GiCape },
    { id: "shoes", label: "Shoes", icon: GiRunningShoe },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
            My Wardrobe
          </h1>
          <p className="text-gray-500 mt-1">{items.length} items in collection</p>
        </div>
        
        <div className="flex gap-2">
          {items.length > 0 && (
            <button onClick={handleClearAll} className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl transition">
                <FaTrash />
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current.click()}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition flex items-center gap-2"
          >
            <FaCloudUploadAlt /> Upload New
          </button>
          <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-gray-900 text-white shadow-md" : "bg-white text-gray-500 hover:bg-gray-100"}`}>
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {/* GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
           <GiHanger className="text-6xl text-gray-200 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-gray-400">Section Empty</h3>
           <p className="text-gray-400">Upload items to fill your {activeTab}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="group bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-50 mb-3 relative">
                <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-50">
                  <FaTrash size={12} />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm truncate">{item.item_name}</h4>
                <div className="flex gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{item.category}</span>
                    <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{item.style}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- UPLOAD & REVIEW MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaMagic className="text-purple-600" /> AI Analysis & Review
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full"><FaTimes /></button>
            </div>

            {/* Content: List of Files */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {processingFiles.map((file, idx) => (
                <div key={idx} className="flex gap-4 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                  {/* Image Preview */}
                  <div className="w-20 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm relative">
                    <img src={file.preview} className="w-full h-full object-cover" alt="preview" />
                    {file.status === 'uploading' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"><FaSpinner className="animate-spin"/></div>}
                    {file.status === 'analyzing' && <div className="absolute inset-0 bg-purple-500/50 flex items-center justify-center text-white text-xs font-bold animate-pulse">Thinking...</div>}
                  </div>

                  {/* Details Form (Editable) */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                        <input 
                            className="font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 w-full mb-2" 
                            value={file.data.item_name || file.file.name}
                            onChange={(e) => {
                                const newData = [...processingFiles];
                                newData[idx].data.item_name = e.target.value;
                                setProcessingFiles(newData);
                            }}
                        />
                        <button onClick={() => setProcessingFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><FaTrash size={14}/></button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                            <select 
                                className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={file.data.category}
                                onChange={(e) => {
                                    const newData = [...processingFiles];
                                    newData[idx].data.category = e.target.value;
                                    setProcessingFiles(newData);
                                }}
                            >
                                <option value="tops">Top</option>
                                <option value="bottoms">Bottom</option>
                                <option value="dresses">Dress</option>
                                <option value="outerwear">Outerwear</option>
                                <option value="shoes">Shoes</option>
                                <option value="accessories">Accessory</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Style</label>
                            <select 
                                className="w-full bg-white border border-gray-200 text-sm rounded-lg p-2 mt-1 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={file.data.style}
                                onChange={(e) => {
                                    const newData = [...processingFiles];
                                    newData[idx].data.style = e.target.value;
                                    setProcessingFiles(newData);
                                }}
                            >
                                <option value="casual">Casual</option>
                                <option value="formal">Formal</option>
                                <option value="party">Party</option>
                                <option value="ethnic">Ethnic/Kurti</option>
                                <option value="sporty">Sporty</option>
                            </select>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {processingFiles.filter(f => f.status === 'ready').length} / {processingFiles.length} Ready
              </span>
              <button 
                onClick={handleSaveAll}
                disabled={processingFiles.some(f => f.status !== 'ready')}
                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
              >
                {processingFiles.some(f => f.status !== 'ready') ? <><FaSpinner className="animate-spin"/> Processing...</> : <><FaCheck /> Save All Items</>}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}