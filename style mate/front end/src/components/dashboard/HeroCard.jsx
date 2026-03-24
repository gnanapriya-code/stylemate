// src/components/dashboard/HeroCard.jsx
import React from "react";

export default function HeroCard() {
  return (
    <div className="rounded-2xl p-8 bg-gradient-to-r from-pink-200 to-purple-100 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-sm text-gray-600">Good Evening</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-pink-600">Welcome — Your personal AI Stylist</h1>
          <p className="mt-2 text-gray-700">Your personal AI stylist is ready to help you look fabulous. Let's create stunning outfits together.</p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => window.location.href = "/recommendations"} className="px-4 py-2 rounded-md bg-pink-500 text-white">
              Get AI Recommendations
            </button>
            <button onClick={() => window.location.href = "/wardrobe"} className="px-4 py-2 rounded-md border">
              Add Clothes
            </button>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="rounded-lg border p-4 bg-white/80 shadow-sm">
            <div className="text-sm text-gray-500">Quick look</div>
            <div className="mt-2 font-medium">vtu21427!</div>
            <div className="text-xs text-gray-600 mt-1">Personalized suggestions ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}
