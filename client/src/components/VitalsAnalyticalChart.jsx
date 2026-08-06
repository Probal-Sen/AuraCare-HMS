import React, { useState } from 'react';
import { Activity, Heart, Thermometer, Scale, ShieldCheck, UserCheck } from 'lucide-react';

const VitalsAnalyticalChart = ({ vitalsData }) => {
  const [activeMetric, setActiveMetric] = useState('bp');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const data = vitalsData && vitalsData.length > 0 ? vitalsData : [
    { date: '15 Jul', bloodPressureSystolic: 130, bloodPressureDiastolic: 85, heartRate: 76, temperature: 98.6, weight: 76.0, spo2: 98, recordedBy: 'Nurse Sunita Verma' },
    { date: '22 Jul', bloodPressureSystolic: 126, bloodPressureDiastolic: 82, heartRate: 74, temperature: 98.4, weight: 75.8, spo2: 99, recordedBy: 'Nurse Sunita Verma' },
    { date: '29 Jul', bloodPressureSystolic: 122, bloodPressureDiastolic: 80, heartRate: 72, temperature: 98.6, weight: 75.5, spo2: 98, recordedBy: 'Nurse Sunita Verma' },
    { date: '01 Aug', bloodPressureSystolic: 120, bloodPressureDiastolic: 80, heartRate: 70, temperature: 98.2, weight: 75.0, spo2: 99, recordedBy: 'Nurse Sunita Verma' },
    { date: '05 Aug', bloodPressureSystolic: 118, bloodPressureDiastolic: 78, heartRate: 68, temperature: 98.6, weight: 74.8, spo2: 99, recordedBy: 'Nurse Sunita Verma' },
  ];

  const latest = data[data.length - 1];

  const getMetricConfig = () => {
    switch (activeMetric) {
      case 'bp':
        return {
          title: 'Blood Pressure Trend (Systolic & Diastolic)',
          unit: 'mmHg',
          min: 60,
          max: 150,
          color: '#2563eb',
          getVal: (d) => d.bloodPressureSystolic,
          getSecVal: (d) => d.bloodPressureDiastolic,
          format: (d) => `${d.bloodPressureSystolic}/${d.bloodPressureDiastolic} mmHg`,
          status: 'Optimal (118/78)',
          statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
        };
      case 'hr':
        return {
          title: 'Heart Rate Trend (BPM)',
          unit: 'BPM',
          min: 50,
          max: 100,
          color: '#e11d48',
          getVal: (d) => d.heartRate,
          format: (d) => `${d.heartRate} BPM`,
          status: 'Normal Resting Rate',
          statusColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400',
        };
      case 'temp':
        return {
          title: 'Body Temperature Trend (°F)',
          unit: '°F',
          min: 96,
          max: 102,
          color: '#d97706',
          getVal: (d) => d.temperature,
          format: (d) => `${d.temperature} °F`,
          status: 'Normal Body Temp',
          statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400',
        };
      case 'spo2':
        return {
          title: 'Oxygen Saturation Trend (SpO2 %)',
          unit: '%',
          min: 90,
          max: 100,
          color: '#059669',
          getVal: (d) => d.spo2,
          format: (d) => `${d.spo2}%`,
          status: 'Excellent Oxygen Level',
          statusColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
        };
      case 'weight':
        return {
          title: 'Body Weight Trend (kg)',
          unit: 'kg',
          min: 60,
          max: 90,
          color: '#8b5cf6',
          getVal: (d) => d.weight,
          format: (d) => `${d.weight} kg`,
          status: 'Healthy Progression (-1.2 kg)',
          statusColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400',
        };
      default:
        return {};
    }
  };

  const config = getMetricConfig();
  const width = 600;
  const height = 180;
  const padding = 30;

  const getY = (val) => {
    const min = config.min;
    const max = config.max;
    const normalized = (val - min) / (max - min);
    return height - padding - normalized * (height - 2 * padding);
  };

  const getX = (index) => {
    const step = (width - 2 * padding) / (data.length - 1);
    return padding + index * step;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(config.getVal(d))}`).join(' ');
  const areaPath = `M ${getX(0)},${height - padding} L ${points} L ${getX(data.length - 1)},${height - padding} Z`;

  let secPoints = null;
  if (config.getSecVal) {
    secPoints = data.map((d, i) => `${getX(i)},${getY(config.getSecVal(d))}`).join(' ');
  }

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-medical-500/10 text-medical-600 dark:text-medical-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Vitals Analytical Chart & Nurse Observations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continuous physiological vital signs tracking recorded by clinical nursing staff
              </p>
            </div>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveMetric('bp')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeMetric === 'bp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Blood Pressure</span>
          </button>

          <button
            onClick={() => setActiveMetric('hr')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeMetric === 'hr'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Heart Rate</span>
          </button>

          <button
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeMetric === 'temp'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp</span>
          </button>

          <button
            onClick={() => setActiveMetric('spo2')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeMetric === 'spo2'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SpO2 %</span>
          </button>

          <button
            onClick={() => setActiveMetric('weight')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeMetric === 'weight'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Weight</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Blood Pressure</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">
              {latest.bloodPressureSystolic}/{latest.bloodPressureDiastolic}
            </span>
            <span className="text-[10px] font-bold text-slate-400">mmHg</span>
          </div>
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            Optimal
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Heart Rate (Pulse)</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{latest.heartRate}</span>
            <span className="text-[10px] font-bold text-slate-400">BPM</span>
          </div>
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
            Normal (68 BPM)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Body Temperature</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{latest.temperature}</span>
            <span className="text-[10px] font-bold text-slate-400">°F</span>
          </div>
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            Afebril (98.6 °F)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Oxygen Saturation</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-extrabold text-slate-900 dark:text-white">{latest.spo2}%</span>
            <span className="text-[10px] font-bold text-slate-400">SpO2</span>
          </div>
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            Excellent
          </span>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative pt-2 pb-1 bg-slate-900/5 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{config.title}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.statusColor}`}>
            Status: {config.status}
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="vitalsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Grid Lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const yVal = height - padding - ratio * (height - 2 * padding);
            return (
              <g key={idx}>
                <line x1={padding} y1={yVal} x2={width - padding} y2={yVal} stroke="#94a3b8" strokeDasharray="3 3" strokeOpacity="0.2" />
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#vitalsGradient)" />

          {/* Primary Trend Line */}
          <polyline fill="none" stroke={config.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />

          {/* Secondary Line for Diastolic BP */}
          {secPoints && (
            <polyline fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" points={secPoints} />
          )}

          {/* Data Points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(config.getVal(d));
            const isHovered = hoveredPoint === i;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                <circle cx={cx} cy={cy} r={isHovered ? 7 : 4.5} fill={config.color} stroke="#ffffff" strokeWidth="2" className="transition-all duration-150" />
                {secPoints && (
                  <circle cx={cx} cy={getY(config.getSecVal(d))} r={isHovered ? 6 : 3.5} fill="#60a5fa" stroke="#ffffff" strokeWidth="1.5" />
                )}
                {/* X-Axis Date Label */}
                <text x={cx} y={height - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">
                  {d.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Tooltip */}
        {hoveredPoint !== null && (
          <div className="mt-2 p-2.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">{data[hoveredPoint].date}:</span>
              <span>{config.format(data[hoveredPoint])}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-medical-400" />
              <span>Recorded by {data[hoveredPoint].recordedBy}</span>
            </div>
          </div>
        )}
      </div>

      {/* Attending Nurse Sign-off Badge */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-medical-50/70 dark:bg-medical-950/40 border border-medical-200/60 dark:border-medical-900/60 text-xs">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-4 h-4 text-medical-600 dark:text-medical-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            Vital signs are recorded during morning ward rounds and verified by <strong className="text-slate-900 dark:text-white">Nurse Sunita Verma</strong>.
          </span>
        </div>
        <span className="hidden sm:inline-block font-semibold text-[11px] text-medical-600 dark:text-medical-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-medical-200 dark:border-medical-800">
          Verified Clinical Log
        </span>
      </div>
    </div>
  );
};

export default VitalsAnalyticalChart;
