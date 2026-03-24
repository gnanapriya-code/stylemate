import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaHeart } from 'react-icons/fa';
import { GiHanger } from 'react-icons/gi';

const API = "http://localhost:4000/api";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${API}/favorites`);
      setFavorites(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const removeFavorite = async (id) => {
    if (!window.confirm("Remove this outfit from favorites?")) return;
    try {
      await axios.delete(`${API}/favorites/${id}`);
      fetchFavorites();
    } catch (err) {
      alert("Error removing item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <FaHeart className="text-red-500" /> My Favorites
        </h1>
        <p className="text-gray-500 mt-2">Your collection of perfect matches.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-white rounded-3xl border-2 border-dashed">
          <GiHanger className="text-6xl mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-400">No Favorites Yet</h3>
          <p className="text-gray-400">Go to "Outfit Ideas" and click the heart icon on designs you love.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 group hover:shadow-xl transition-all relative">
              
              {/* Images Grid */}
              <div className="flex h-64 bg-gray-100">
                {/* Dynamically size images based on item count */}
                {fav.items && fav.items.map((item, idx) => (
                  <div key={idx} className="flex-1 relative border-r border-white last:border-0 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.item_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                    />
                  </div>
                ))}
              </div>

              {/* Info & Actions */}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {fav.type === 'dress' ? 'One-Piece Look' : 'Combo Outfit'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {fav.items.map(i => i.item_name).join(" + ")}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFavorite(fav.id)}
                    className="text-gray-400 hover:text-red-500 transition p-2 bg-gray-50 rounded-full"
                    title="Remove"
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="mt-4 flex gap-2">
                   {fav.items.map((item, i) => (
                     <span key={i} className="text-[10px] uppercase font-bold tracking-wider bg-purple-50 text-purple-600 px-2 py-1 rounded-md">
                       {item.category}
                     </span>
                   ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}