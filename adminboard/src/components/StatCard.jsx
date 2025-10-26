// components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} p-6 rounded-xl shadow-md text-white transform transition-transform duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-white/60">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;