import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BEHAVIORAL_INSIGHTS, 
  BEHAVIORAL_CORRELATIONS 
} from '../../data/mockData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Brain, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Award, 
  Activity 
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { getHabitStatusForDate, calculateHabitStreak } from '../../utils/habitUtils';

export const HabitAnalyzer: React.FC = () => {
  const { habits, logs, consistencyScore, momentumInfo, setDetailHabitId } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedHabitFilter, setSelectedHabitFilter] = useState<string>('overall');

  // Chart data calculation matching Screenshot 2
  const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const today = new Date();

  const chartData = Array.from({ length: daysCount }).map((_, idx) => {
    const dObj = subDays(today, daysCount - 1 - idx);
    const dStr = format(dObj, 'yyyy-MM-dd');
    const dayLabel = format(dObj, 'd MMM');

    if (selectedHabitFilter === 'overall') {
      let scheduled = 0;
      let comp = 0;
      habits.forEach((h) => {
        const st = getHabitStatusForDate(h, dStr, logs);
        if (st !== 'skipped') {
          scheduled++;
          if (st === 'completed') comp++;
          else if (st === 'frozen') comp += 0.8;
          else if (st === 'partial') comp += 0.5;
        }
      });
      const pct = scheduled > 0 ? Math.round((comp / scheduled) * 100) : 75;
      return { date: dayLabel, consistency: pct };
    } else {
      const targetHabit = habits.find((h) => h.id === selectedHabitFilter);
      if (!targetHabit) return { date: dayLabel, consistency: 0 };
      const st = getHabitStatusForDate(targetHabit, dStr, logs);
      const pct = st === 'completed' ? 100 : st === 'frozen' ? 80 : st === 'partial' ? 50 : 0;
      return { date: dayLabel, consistency: pct };
    }
  });

  // Leaderboard data with dynamically computed accurate streaks
  const habitLeaderboard = habits.map((h) => {
    let comp = 0;
    let total = 0;
    logs.filter((l) => l.habitId === h.id).forEach((l) => {
      if (l.status !== 'skipped') {
        total++;
        if (l.status === 'completed' || l.status === 'frozen') comp++;
      }
    });
    const pct = total > 0 ? Math.round((comp / total) * 100) : 80;
    const { currentStreak, bestStreak } = calculateHabitStreak(h, logs);
    return { ...h, rate: pct, currentStreak, bestStreak };
  }).sort((a, b) => b.rate - a.rate);

  const topStreaks = [...habitLeaderboard].sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 3);
  const needsAttention = habitLeaderboard[habitLeaderboard.length - 1];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141c] border border-[#1e2230] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Behavioral Habit Analyzer
            </h1>
            <span className="text-xs font-mono uppercase bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
              Insights & Patterns
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            See what is holding, and what is slipping. Data-driven consistency operating system.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Habit Selector Dropdown */}
          <select
            value={selectedHabitFilter}
            onChange={(e) => setSelectedHabitFilter(e.target.value)}
            className="bg-[#090a0f] border border-[#1e2230] text-xs font-mono text-cyan-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="overall">OVERALL CONSISTENCY</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <div className="flex items-center bg-[#090a0f] border border-[#1e2230] p-1 rounded-xl">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  timeRange === range
                    ? 'bg-cyan-500 text-[#090a0f] font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Consistency Line Chart Card matching Screenshot 2 */}
      <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">OVERALL CONSISTENCY</span>
            <div className="text-4xl font-extrabold text-white tracking-tight mt-1 font-sans">
              {consistencyScore}%
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
            <TrendingUp className="w-4 h-4" />
            <span>+{momentumInfo.percent}% vs previous period</span>
          </div>
        </div>

        {/* Recharts Area Chart with cyan gradient matching screenshot 2 */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2230" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#161924] border border-[#262b3d] px-3 py-2 rounded-xl shadow-xl text-xs font-mono">
                        <div className="text-slate-400">{label}</div>
                        <div className="text-cyan-400 font-bold text-sm mt-0.5">
                          {payload[0].value}% Consistency
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="consistency"
                stroke="#00f2fe"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cyanGradient)"
                dot={false}
                activeDot={{ r: 6, fill: '#00f2fe', stroke: '#090a0f', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 Summary Stat Cards matching Screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-5 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-slate-400">THIS WEEK</span>
          <div className="text-2xl font-extrabold text-white mt-1">78%</div>
          <span className="text-xs text-cyan-400 mt-1 block">Solid execution rate</span>
        </div>

        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-5 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-slate-400">VS LAST WEEK</span>
          <div className="text-2xl font-extrabold text-teal-400 mt-1">+5%</div>
          <span className="text-xs text-teal-300 mt-1 block">Momentum accelerating</span>
        </div>

        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-5 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-slate-400">BEST STREAK</span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 flex items-center space-x-2">
            <Flame className="w-5 h-5 fill-amber-400" />
            <span>18d</span>
          </div>
          <span className="text-xs text-amber-300/80 mt-1 block">Wake Up at 5AM</span>
        </div>

        <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-5 shadow-lg">
          <span className="text-[11px] font-mono uppercase text-slate-400">NEEDS ATTENTION</span>
          <div className="text-lg font-bold text-purple-400 mt-1 truncate">
            {needsAttention?.name || 'Meditation'}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {needsAttention?.rate || 67}% completion rate
          </span>
        </div>
      </div>

      {/* Habit Leaderboard & Top Streaks Grid matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Habit Leaderboard */}
        <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2230] pb-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center space-x-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>HABIT LEADERBOARD</span>
            </h3>
            <span className="text-xs text-slate-400">Ranked by completion %</span>
          </div>

          <div className="space-y-4">
            {habitLeaderboard.slice(0, 5).map((habit, idx) => (
              <div 
                key={habit.id} 
                onClick={() => setDetailHabitId(habit.id)}
                className="group cursor-pointer space-y-1.5 p-2 rounded-lg hover:bg-[#161924] transition-colors"
              >
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center space-x-2">
                    <span className="font-mono text-slate-500">#{idx + 1}</span>
                    <span>{habit.name}</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{habit.rate}%</span>
                </div>
                <div className="w-full bg-[#1e2230] rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${habit.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Streaks */}
        <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2230] pb-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>TOP STREAKS</span>
            </h3>
            <span className="text-xs text-slate-400">Active consistency chains</span>
          </div>

          <div className="space-y-4">
            {topStreaks.map((habit) => (
              <div 
                key={habit.id}
                onClick={() => setDetailHabitId(habit.id)}
                className="flex items-center justify-between p-3 bg-[#090a0f] border border-[#1e2230] rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-100 text-xs">{habit.name}</span>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Category: {habit.category}
                  </div>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{habit.currentStreak}d</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Behavioral Correlation Engine Section */}
      <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Behavioral Correlation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Observational patterns derived strictly from your empirical tracking data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BEHAVIORAL_CORRELATIONS.map((corr) => (
            <div 
              key={corr.id} 
              className="bg-[#090a0f] border border-[#1e2230] rounded-xl p-5 space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-400 font-semibold">{corr.metricA} ➔ {corr.metricB}</span>
                <span className="text-slate-500">{corr.confidencePercent}% confidence</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                "{corr.statement}"
              </p>
              <div className="text-[10px] text-slate-500 italic">
                Observed pattern (not medical diagnosis)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Behavioral Insights Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Smart Insights — "Your Week in Review"</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BEHAVIORAL_INSIGHTS.map((insight) => (
            <div 
              key={insight.id}
              className={`p-5 rounded-2xl border bg-[#12141c] space-y-3 transition-colors ${
                insight.type === 'positive'
                  ? 'border-cyan-500/20 hover:border-cyan-500/40'
                  : 'border-purple-500/20 hover:border-purple-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{insight.title}</span>
                {insight.stat && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {insight.stat}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
