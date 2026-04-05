import React, { useState } from 'react';

const LineChart = ({ data }) => {
  const [hoverPoint, setHoverPoint] = useState(null);

  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense))) * 1.1; 
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingLeft = 45; // Added padding for the Y-axis labels
  
  const xMap = (idx) => paddingLeft + (idx / (data.length - 1)) * (svgWidth - paddingLeft);
  const yMap = (val) => svgHeight - (val / maxVal) * svgHeight;
  
  const pointsIncome = data.map((d, i) => `${xMap(i)},${yMap(d.income)}`).join(' ');
  const pointsExpense = data.map((d, i) => `${xMap(i)},${yMap(d.expense)}`).join(' ');

  // Helper to format Y-axis numbers (e.g., 18400 -> $18.4k)
  const formatYAxis = (val) => {
    if (val === 0) return '$0';
    return `$${(val / 1000).toFixed(1)}k`;
  };

  return (
    <div className="flex-1 w-full relative min-h-[220px]" onMouseLeave={() => setHoverPoint(null)}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        
        {/* Draw Y-Axis Grid Lines & Labels */}
        {[0, 1, 2, 3].map(i => {
          const yPos = (i * svgHeight) / 3;
          const valValue = maxVal - (maxVal * i) / 3;
          return (
            <g key={`grid-${i}`}>
              <text x="0" y={yPos + 4} className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium">
                {formatYAxis(valValue)}
              </text>
              <line x1={paddingLeft} y1={yPos} x2={svgWidth} y2={yPos} stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" />
            </g>
          );
        })}

        {/* Draw Income (Green) & Expense (Red) Lines */}
        <polyline points={pointsIncome} fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pointsExpense} fill="none" stroke="currentColor" className="text-red-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Draw Data Dots */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xMap(i)} cy={yMap(d.income)} r="4" fill="currentColor" className="text-emerald-500" />
            <circle cx={xMap(i)} cy={yMap(d.expense)} r="4" fill="currentColor" className="text-red-500" />
          </g>
        ))}
        
        {/* Hover interaction zones */}
        {data.map((d, i) => {
          const widthPerZone = (svgWidth - paddingLeft) / Math.max(1, data.length - 1);
          return <rect key={i} x={xMap(i) - widthPerZone / 2} y="0" width={widthPerZone} height={svgHeight} fill="transparent" className="cursor-crosshair" onMouseEnter={() => setHoverPoint({ index: i, ...d, x: xMap(i), yInc: yMap(d.income), yExp: yMap(d.expense) })} />;
        })}
        
        {/* Hover Crosshair & Tooltip Anchors */}
        {hoverPoint && (
          <>
            <line x1={hoverPoint.x} y1="0" x2={hoverPoint.x} y2={svgHeight} stroke="currentColor" className="text-gray-400 dark:text-gray-500" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" pointerEvents="none" />
            <circle cx={hoverPoint.x} cy={hoverPoint.yInc} r="6" fill="currentColor" className="text-white dark:text-[#1E1E1E] stroke-emerald-500" strokeWidth="3" pointerEvents="none" />
            <circle cx={hoverPoint.x} cy={hoverPoint.yExp} r="6" fill="currentColor" className="text-white dark:text-[#1E1E1E] stroke-red-500" strokeWidth="3" pointerEvents="none" />
          </>
        )}
      </svg>
      
      {/* X-Axis Labels (Mon, Tue, Jan, Feb) */}
      <div className="absolute left-0 right-0 bottom-[-30px] flex justify-between px-[2%]">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transform -translate-x-1/2" style={{ position: 'absolute', left: `${(xMap(i) / svgWidth) * 100}%` }}>{d.label}</span>
        ))}
      </div>

      {/* Interactive Tooltip Pop-up */}
      {hoverPoint && (
        <div className="absolute bg-[#0F172A] dark:bg-[#121212] text-white p-3 rounded-xl shadow-2xl text-xs z-10 pointer-events-none transition-all duration-100 ease-out min-w-[120px] border dark:border-white/10" style={{ left: `${(hoverPoint.x / svgWidth) * 100}%`, top: `${Math.min(hoverPoint.yInc, hoverPoint.yExp) - 15}px`, transform: `translate(${hoverPoint.index === 0 ? '0%' : hoverPoint.index === data.length - 1 ? '-100%' : '-50%'}, -100%)` }}>
          <p className="font-bold mb-2 border-b border-gray-700 dark:border-gray-800 pb-2 text-[10px] uppercase tracking-widest text-gray-300 dark:text-gray-400">{hoverPoint.label}</p>
          <div className="flex items-center justify-between space-x-4 mb-2"><span className="flex items-center text-emerald-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>Income</span><span className="font-bold text-sm">${hoverPoint.income.toLocaleString()}</span></div>
          <div className="flex items-center justify-between space-x-4"><span className="flex items-center text-red-400"><div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>Expense</span><span className="font-bold text-sm">${hoverPoint.expense.toLocaleString()}</span></div>
        </div>
      )}
    </div>
  );
};

export default LineChart;