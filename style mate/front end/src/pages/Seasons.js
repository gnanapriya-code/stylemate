import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GiFlowers, GiSun, GiFallingLeaf, GiSnowman } from 'react-icons/gi';

const seasonsData = [
  { name: 'Spring', icon: GiFlowers, gradient: 'from-pink-100 to-purple-100', color: 'text-pink-600' },
  { name: 'Summer', icon: GiSun, gradient: 'from-yellow-100 to-orange-100', color: 'text-yellow-600' },
  { name: 'Fall', icon: GiFallingLeaf, gradient: 'from-orange-100 to-red-100', color: 'text-orange-700' },
  { name: 'Winter', icon: GiSnowman, gradient: 'from-blue-100 to-indigo-100', color: 'text-blue-700' },
];

const Seasons = () => {
  const navigate = useNavigate();
  return (
    <div className="p-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Select a Season</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seasonsData.map((season) => (
          <div key={season.name} onClick={() => console.log(season.name)} className={`bg-gradient-to-br ${season.gradient} p-8 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition transform hover:scale-105 flex flex-col items-center justify-center h-64`}>
            <season.icon className={`text-6xl ${season.color} mb-4`} />
            <h3 className="text-2xl font-bold text-gray-800">{season.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Seasons;