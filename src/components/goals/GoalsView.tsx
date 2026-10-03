import React from 'react';
import { useApp } from '../../context/AppContext';
import { LIFE_AREAS } from '../../data/mockData';
import { ProgressRing } from '../common/ProgressRing';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Pin, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

export const GoalsView: React.FC = () => {
  const { goals, habits, setIsCreateGoalOpen, updateGoalProgress } = useApp();

  const achievedCount = goals.filter((g) => g.status === 'achieved').length;
  const totalGoals = goals.length;
  const overallAchievedPct = Math.round((achievedCount / (totalGoals || 1)) * 100);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner matching Screenshot 1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141c] border border-[#1e2230] p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            GOALS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ten areas of life, broken into small steps. Each goal connected to daily habits.
          </p>
        </div>

        <button
          onClick={() => setIsCreateGoalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-bold text-xs shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Top Progress Overview Card matching Screenshot 1 */}
      <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <ProgressRing
          percentage={overallAchievedPct}
          size={110}
          strokeWidth={8}
          color="#06b6d4"
          showText={false}
        >
          <span className="text-lg font-extrabold text-white font-mono">{achievedCount}/{totalGoals}</span>
        </ProgressRing>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">GOALS ACHIEVED</span>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
            Mastering 10 Areas of Life
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Connect daily routines to long-term identity shift. Habits provide the system; goals define the trajectory.
          </p>
        </div>
      </div>

      {/* Areas of Life Grid matching Screenshot 1 */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">AREAS OF LIFE</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LIFE_AREAS.map((area) => {
            const areaGoals = goals.filter((g) => g.areaId === area.id);
            const areaAchieved = areaGoals.filter((g) => g.status === 'achieved').length;

            return (
              <div 
                key={area.id}
                className="bg-[#12141c] hover:bg-[#161924] border border-[#1e2230] hover:border-slate-700 p-4 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{area.icon}</span>
                  <h3 className="font-bold text-xs text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {area.name}
                  </h3>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">
                  {areaGoals.length} goals • {areaAchieved} achieved
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Priorities Goals List matching Screenshot 1 */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">TOP PRIORITIES</h2>

        <div className="space-y-4">
          {goals.map((goal) => {
            const daysRemaining = differenceInDays(parseISO(goal.targetDate), new Date());
            const connectedList = habits.filter((h) => goal.connectedHabitIds.includes(h.id));
            const pct = Math.round(((goal.currentValue || 0) / (goal.targetValue || 100)) * 100);

            return (
              <div 
                key={goal.id}
                className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-bold text-white tracking-tight">{goal.title}</h3>
                      <Pin className="w-3.5 h-3.5 text-rose-500 fill-rose-500 rotate-45" />
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold uppercase border border-cyan-500/20">
                        {goal.status.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {goal.category.toUpperCase()}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {daysRemaining > 0 ? `${daysRemaining} days left` : 'Due today'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-xl font-extrabold text-cyan-400">{pct}%</span>
                    <div className="text-[11px] text-slate-500">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </div>
                  </div>
                </div>

                {/* Progress Bar with Cyan Glow */}
                <div className="w-full bg-[#1e2230] rounded-full h-3 overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500 cyan-glow"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Connected Habits Chips */}
                {connectedList.length > 0 && (
                  <div className="pt-2 border-t border-[#1e2230]/60 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[11px] font-mono text-slate-500">CONNECTED HABITS:</span>
                      {connectedList.map((h) => (
                        <span 
                          key={h.id}
                          className="px-2.5 py-1 rounded-lg bg-[#090a0f] border border-[#1e2230] text-slate-300 text-[11px] flex items-center space-x-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{h.name}</span>
                          <span className="text-amber-400 font-mono text-[10px] ml-1">🔥 {h.currentStreak}d</span>
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => updateGoalProgress(goal.id, Math.min(goal.targetValue || 100, (goal.currentValue || 0) + 5))}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      + Update Progress
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
