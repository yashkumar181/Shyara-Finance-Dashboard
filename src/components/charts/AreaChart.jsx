import React, { useState } from 'react';

const AreaChart = ({ data = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // Safely handle empty states to prevent division by zero
  const safeData = data && data.length > 0 ? data : [
    { label: 'No Data', income: 0, expense: 0 }
  ];

  const maxDataValue = Math.max(...safeData.flatMap(d => [(d.income || 0), (d.expense || 0)]));
  const maxValue = maxDataValue > 0 ? maxDataValue * 1.2 : 1000;

  const width = 800;
  const height = 250;
  const pad = { top: 20, right: 20, bottom: 30, left: 60 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const getX = (i) => pad.left + (i * (chartW / Math.max(safeData.length - 1, 1)));
  const getY = (val) => pad.top + chartH - (((val || 0) / maxValue) * chartH);

  const incomePoints = safeData.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');
  const expensePoints = safeData.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' ');

  const incomeArea = `${pad.left},${getY(0)} ${incomePoints} ${getX(safeData.length - 1)},${getY(0)}`;
  const expenseArea = `${pad.left},${getY(0)} ${expensePoints} ${getX(safeData.length - 1)},${getY(0)}`;

  return (
    // FIX: Removed overflow-x-auto and fixed min-width. Now it is purely responsive.
    <div className="w-full relative pb-2"> 
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        
        {/* Background Grid Lines */}
        {[0, 1, 2, 3, 4].map(i => {
          const y = pad.top + chartH - (i * (chartH / 4));
          const val = (maxValue * i) / 4;
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="currentColor" className="text-gray-200 dark:text-[#262626]" strokeDasharray="4 4" />
              <text x={pad.left - 10} y={y + 4} textAnchor="end" className="text-[10px] font-bold fill-gray-400 dark:fill-[#a3a3a3]">
                ₹{val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* Income Area (Invested) */}
        <polygon points={incomeArea} fill="url(#incomeGrad)" opacity="0.3" />
        <polyline points={incomePoints} fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {/* Expense Area (Current Value) */}
        <polygon points={expenseArea} fill="url(#expenseGrad)" opacity="0.3" />
        <polyline points={expensePoints} fill="none" stroke="#10B981" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {/* Hover Interaction Overlay */}
        {safeData.map((d, i) => {
          const x = getX(i);
          return (
            <g key={i} onMouseEnter={() => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)} className="cursor-pointer">
              <line x1={x} y1={pad.top} x2={x} y2={pad.top + chartH} stroke="transparent" strokeWidth="40" />
              {activeIndex === i && (
                <>
                  <line x1={x} y1={pad.top} x2={x} y2={pad.top + chartH} stroke="#0A3D8B" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  <circle cx={x} cy={getY(d.income)} r="4" fill="#94A3B8" stroke="#fff" strokeWidth="2" />
                  <circle cx={x} cy={getY(d.expense)} r="4" fill="#10B981" stroke="#fff" strokeWidth="2" />
                </>
              )}
              <text x={x} y={height - 5} textAnchor="middle" className="text-[10px] font-bold fill-gray-500 dark:fill-[#a3a3a3] uppercase tracking-wider">{d.label}</text>
            </g>
          )
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
      
      {/* FIX: Tooltip uses relative % math to track perfectly regardless of how the SVG scales */}
      {activeIndex !== null && (
        <div 
          className="absolute bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] shadow-xl rounded-xl p-3 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all z-50 min-w-[140px]"
          style={{
            left: `${(getX(activeIndex) / width) * 100}%`,
            top: `calc(${((getY(Math.max(safeData[activeIndex].expense || 0, safeData[activeIndex].income || 0))) / height) * 100}% - 25px)`
          }}
        >
          <p className="text-[10px] font-bold text-gray-500 dark:text-[#a3a3a3] uppercase tracking-widest mb-2 border-b border-gray-100 dark:border-[#333] pb-1">{safeData[activeIndex].label}</p>
          <div className="flex justify-between items-center gap-4 mb-1">
            <span className="text-xs font-bold text-gray-500 flex items-center"><div className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></div>Invested</span>
            <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">₹{(safeData[activeIndex].income || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-bold text-gray-500 flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div>Current</span>
            <span className="text-xs font-bold text-[#0F172A] dark:text-gray-200">₹{(safeData[activeIndex].expense || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaChart;