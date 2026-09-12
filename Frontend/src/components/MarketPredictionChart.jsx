import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area
} from 'recharts';
import { TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const MarketPredictionChart = ({
  historical = [],
  forecast = [],
  commodityName = '',
  unit = '₹/Qtl',
  type = 'price', // 'price' | 'demand'
  height = 240,
  compact = false
}) => {
  if ((!historical || historical.length === 0) && (!forecast || forecast.length === 0)) {
    return (
      <div
        className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs text-center"
        style={{ height }}
      >
        <AlertCircle className="w-6 h-6 mb-1.5 text-slate-300" />
        <span>No historical trend data available for {commodityName || 'this crop'}.</span>
      </div>
    );
  }

  // Format data series for Recharts
  // Connect the last historical point with the first forecast point for smooth continuity
  const chartData = [];

  historical.forEach((item, idx) => {
    const val = type === 'price' ? item.avg_modal_price : item.demand;
    chartData.push({
      month: item.month,
      historical: val,
      forecast: idx === historical.length - 1 ? val : null, // Bridge point
      isForecast: false,
    });
  });

  forecast.forEach((item) => {
    const val = type === 'price' ? item.predicted_price : item.predicted_demand;
    chartData.push({
      month: item.month,
      historical: null,
      forecast: val,
      isForecast: true,
    });
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const histVal = payload.find((p) => p.dataKey === 'historical')?.value;
      const foreVal = payload.find((p) => p.dataKey === 'forecast')?.value;
      const isPredicted = foreVal !== undefined && foreVal !== null && histVal === undefined;

      return (
        <div className="bg-slate-900/95 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700/80 backdrop-blur-md">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          {histVal !== undefined && histVal !== null && (
            <p className="text-emerald-400 font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Actual: {type === 'price' ? `₹${histVal.toLocaleString('en-IN')}` : histVal.toLocaleString('en-IN')} {unit}
            </p>
          )}
          {isPredicted && (
            <p className="text-amber-300 font-black flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              ML Forecast: {type === 'price' ? `₹${foreVal.toLocaleString('en-IN')}` : foreVal.toLocaleString('en-IN')} {unit}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs">
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900">
                {type === 'price' ? '12-Month Market Price Trend & XGBoost Forecast' : 'Demand Dynamics & Forecast'}
              </h4>
              <p className="text-[10px] text-slate-500">Historical APMC actuals + Machine Learning next quarter outlook</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Actual
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-amber-500" />
              ML Forecast
            </span>
          </div>
        </div>
      )}

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Historical line & area */}
            <Area
              type="monotone"
              dataKey="historical"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorHistorical)"
            />

            {/* Forecast dashed line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#d97706"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 4, fill: '#d97706', strokeWidth: 1.5, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#b45309' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
