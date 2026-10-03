import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Snowflake, 
  Grid, 
  BarChart3, 
  Brain, 
  ArrowRight, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-24 py-8 pb-24 max-w-6xl mx-auto">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BUILT FOR CONSISTENCY, NOT DISTRACTION</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight font-sans">
          Build habits that <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">survive real life.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Track your routines. Understand your patterns. Build consistency that lasts without chasing fragile streaks or toxic perfectionism.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setActiveTab('today')}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-[#090a0f] font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105"
          >
            <span>Start Tracking</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className="px-8 py-3.5 rounded-2xl bg-[#12141c] hover:bg-[#161924] border border-[#1e2230] text-slate-200 font-bold text-sm transition-colors"
          >
            Explore Insights
          </button>
        </div>

        {/* Hero Visual Mockup Teaser */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#1e2230] pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-cyan-400 font-semibold">CONSIST OPERATING SYSTEM</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-slate-300">
              <div className="bg-[#090a0f] border border-[#1e2230] p-4 rounded-xl">
                <div className="text-slate-500 text-[10px]">CONSISTENCY SCORE</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">84%</div>
                <div className="text-[10px] text-slate-400 mt-1">Weighted algorithm</div>
              </div>

              <div className="bg-[#090a0f] border border-[#1e2230] p-4 rounded-xl">
                <div className="text-slate-500 text-[10px]">STREAK FREEZE</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">❄️ 3 Tokens</div>
                <div className="text-[10px] text-slate-400 mt-1">Protected travel days</div>
              </div>

              <div className="bg-[#090a0f] border border-[#1e2230] p-4 rounded-xl">
                <div className="text-slate-500 text-[10px]">MOMENTUM VELOCITY</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">+14%</div>
                <div className="text-[10px] text-slate-400 mt-1">Building momentum</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1: Streak Freeze Engine */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Streaks that forgive real life
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Streak Freeze Engine
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Protect your momentum when life gets in the way. Travel, rest days, unexpected events, or missed days don't have to erase months of discipline.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Manually protect or enable auto-freeze mode</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Distinguishes completed, missed, frozen, and rest days</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Never makes missing one day feel like total failure</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6 bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-blue-400 font-bold flex items-center space-x-1.5">
              <Snowflake className="w-4 h-4" />
              <span>STREAK PROTECTION</span>
            </span>
            <span className="text-slate-400">3 Tokens Remaining</span>
          </div>

          <div className="p-4 bg-[#090a0f] border border-blue-500/20 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold text-white">
              <span>Sept 12 — Flight & Travel</span>
              <span className="text-blue-400 font-mono">FROZEN ❄️</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Auto-freeze preserved your 18-day workout streak during flight delay.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Unified Habit Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1 bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
            <Grid className="w-4 h-4" />
            <span>UNIFIED RHYTHM SYSTEM</span>
          </div>

          <div className="p-4 bg-[#090a0f] border border-[#1e2230] rounded-xl font-mono text-xs space-y-2">
            <div className="flex justify-between text-slate-300 border-b border-[#1e2230] pb-2">
              <span>HABIT</span>
              <span>M T W T F S S</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Workout</span>
              <span className="text-cyan-400">✓ ✓ — ✓ ✓ — —</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Reading</span>
              <span className="text-cyan-400">✓ ✓ ✓ ✓ ✓ ✓ ✓</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            One grid for every rhythm
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The Unified Habit Grid
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Daily workouts, three-times-a-week runs, weekend chores, and monthly reviews — all tracked in one visual system.
          </p>
        </div>
      </section>

      {/* Feature Section 3: Behavioral Habit Analyzer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            See why you're consistent
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Behavioral Habit Analyzer
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Go beyond simple completion percentages. Discover when you perform best, which habits influence each other, and where your routine starts breaking down.
          </p>
        </div>

        <div className="lg:col-span-6 bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-bold">
            <Brain className="w-4 h-4" />
            <span>BEHAVIORAL CORRELATION</span>
          </div>

          <div className="p-4 bg-[#090a0f] border border-purple-500/20 rounded-xl space-y-1">
            <span className="text-cyan-400 text-xs font-bold">Energy ➔ Habit Completion</span>
            <p className="text-xs text-slate-300">
              "On high-energy days (≥ 7), you complete 91% of your scheduled habits."
            </p>
          </div>
        </div>
      </section>

      {/* Footer Call to Action Banner */}
      <section className="bg-gradient-to-r from-[#12141c] via-[#161924] to-[#12141c] border border-[#1e2230] rounded-3xl p-8 lg:p-12 text-center space-y-6 shadow-2xl">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Don't chase perfect days. Build consistent ones.
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Experience a personal operating system designed for focus, clarity, and long-term behavior change.
        </p>
        <button
          onClick={() => setActiveTab('today')}
          className="px-8 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-transform hover:scale-105"
        >
          Launch Dashboard Now
        </button>
      </section>

    </div>
  );
};
