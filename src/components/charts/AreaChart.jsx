import React, { useState } from 'react';

const AreaChart = ({ data }) => {
  const [hoverPoint, setHoverPoint] = useState(null);

  const maxVal = Math.max(...data.map(d => Math.max(d.invested, d.current))) * 1.1;
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 50;
  const paddingBottom = 30;
  const chartWidth = svgWidth - paddingLeft;
  const chartHeight = svgHeight - paddingBottom;

  const xMap = (idx) => paddingLeft + (idx / (data.length - 1)) * chartWidth;
  const yMap = (val) => chartHeight - (val / maxVal) * chartHeight;

  // Paths for the solid lines
  const lineInvested = data.map((d, i) => `${xMap(i)},${yMap(d.invested)}`).join(' ');
  const lineCurrent = data.map((d, i) => `${xMap(i)},${yMap(d.current)}`).join(' ');

  // Paths for the shaded areas (connecting to the bottom corners)
  const areaInvested = `${xMap(0)},${chartHeight} ${lineInvested} ${xMap(data.length - 1)},${chartHeight}`;
  const areaCurrent = `${xMap(0)},${chartHeight} ${lineCurrent} ${xMap(data.length - 1)},${chartHeight}`;

  const formatYAxis = (val) => val === 0 ? '$0' : `$${(val / 1000).toFixed(0)}k`;

  return (
    <div className="flex-1 w-full relative min-h-[250px]" onMouseLeave={() => setHoverPoint(null)}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        
        {/* Y-Axis Grid Lines & Labels */}
        {[0, 1, 2, 3].map(i => {
          const yPos = (i * chartHeight) / 3;
          const valValue = maxVal - (maxVal * i) / 3;
          return (
            <g key={`grid-${i}`}>
              <text x="0" y={yPos + 4} className="text-[10px] fill-gray-400 dark:fill-gray-500 font-medium">
                {formatYAxis(valValue)}
              </text>
              <line x1={paddingLeft} y1={yPos} x2={svgWidth} y2={yPos} stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeWidth="1" strokeDasharray="3 3" />
            </g>
          );
        })}

        {/* Shaded Areas */}
        <polygon points={areaInvested} fill="currentColor" className="text-slate-400 dark:text-slate-500 opacity-10 dark:opacity-20" />
        <polygon points={areaCurrent} fill="currentColor" className="text-emerald-500 opacity-10 dark:opacity-20" />

        {/* Solid Lines */}
        <polyline points={lineInvested} fill="none" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={lineCurrent} fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interaction Hover Zones */}
        {data.map((d, i) => {
          const widthPerZone = chartWidth / Math.max(1, data.length - 1);
          return <rect key={i} x={xMap(i) - widthPerZone / 2} y="0" width={widthPerZone} height={chartHeight} fill="transparent" className="cursor-crosshair" onMouseEnter={() => setHoverPoint({ index: i, ...d, x: xMap(i), yInv: yMap(d.invested), yCur: yMap(d.current) })} />;
        })}

        {/* Hover Crosshair & Tooltip Anchors */}
        {hoverPoint && (
          <>
            <line x1={hoverPoint.x} y1="0" x2={hoverPoint.x} y2={chartHeight} stroke="currentColor" className="text-gray-400 dark:text-gray-500" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" pointerEvents="none" />
            <circle cx={hoverPoint.x} cy={hoverPoint.yInv} r="4" fill="currentColor" className="text-white dark:text-[#1E1E1E] stroke-slate-500" strokeWidth="2" pointerEvents="none" />
            <circle cx={hoverPoint.x} cy={hoverPoint.yCur} r="4" fill="currentColor" className="text-white dark:text-[#1E1E1E] stroke-emerald-500" strokeWidth="2" pointerEvents="none" />
          </>
        )}
      </svg>

      {/* X-Axis Labels */}
      <div className="absolute left-0 right-0 bottom-0 flex justify-between px-[2%] pl-[50px]">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transform -translate-x-1/2" style={{ position: 'absolute', left: `${paddingLeft + (i / (data.length - 1)) * chartWidth}px` }}>{d.month}</span>
        ))}
      </div>

      {/* Interactive Tooltip Pop-up */}
      {hoverPoint && (
        <div className="absolute bg-[#0F172A] dark:bg-[#121212] text-white p-3 rounded-xl shadow-2xl text-xs z-10 pointer-events-none transition-all duration-100 ease-out min-w-[140px] border dark:border-white/10" style={{ left: `${(hoverPoint.x / svgWidth) * 100}%`, top: `${Math.min(hoverPoint.yInv, hoverPoint.yCur) - 15}px`, transform: `translate(${hoverPoint.index === 0 ? '0%' : hoverPoint.index === data.length - 1 ? '-100%' : '-50%'}, -100%)` }}>
          <p className="font-bold mb-2 border-b border-gray-700 dark:border-gray-800 pb-2 text-[10px] uppercase tracking-widest text-gray-300 dark:text-gray-400">{hoverPoint.month}</p>
          <div className="flex items-center justify-between space-x-4 mb-2"><span className="flex items-center text-emerald-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></div>Current</span><span className="font-bold text-sm">${hoverPoint.current.toLocaleString()}</span></div>
          <div className="flex items-center justify-between space-x-4"><span className="flex items-center text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></div>Invested</span><span className="font-bold text-sm">${hoverPoint.invested.toLocaleString()}</span></div>
        </div>
      )}
    </div>
  );
};

export default AreaChart;