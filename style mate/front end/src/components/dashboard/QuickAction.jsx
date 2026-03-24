// src/components/dashboard/QuickAction.jsx
import React from "react";

export default function QuickAction({ title, desc, onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer rounded-lg p-4 bg-white/60 shadow-sm hover:shadow-md transition">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-gray-600 mt-2">{desc}</div>
    </div>
  );
}
