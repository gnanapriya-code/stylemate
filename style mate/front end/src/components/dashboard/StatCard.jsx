// src/components/dashboard/StatCard.jsx
import React from "react";

export default function StatCard({ title, value }) {
  return (
    <div className="rounded-xl p-6 bg-white/60 shadow-md flex flex-col">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-4 text-3xl font-bold">{value}</div>
    </div>
  );
}
