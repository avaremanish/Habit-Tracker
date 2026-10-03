import React from 'react';
import { useApp } from '../../context/AppContext';
import type { ActiveTab } from '../../context/AppContext';
import { 
  CheckSquare, 
  Grid, 
  Target, 
  BarChart3, 
  Bell, 
  Settings, 
  Snowflake, 
  CalendarDays,
  Sparkles,
  Flame,
  Globe,
  User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    user, 
    notifications, 
    setIsNotificationsOpen, 
    setIsSettingsOpen,
    supabaseUser,
    setIsAuthModalOpen
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'habits', label: 'Habits', icon: Grid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-md border-b border-[#1e2230] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('today')}
              className="flex items-center space-x-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-teal-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#090a0f] rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CONSIST
                </span>
                <span className="text-[9px] font-mono block text-cyan-400 tracking-widest uppercase -mt-1">
                  CONSISTENCY OS
                </span>
              </div>
            </button>

            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#12141c] border border-[#1e2230] text-xs font-semibold text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{user.overallStreak} Day Streak</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-[#12141c]/90 border border-[#1e2230] rounded-full p-1 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2230]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab(activeTab === 'landing' ? 'today' : 'landing')}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#12141c] hover:bg-[#161924] border border-[#1e2230] transition-colors"
              title="Toggle product landing page view"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeTab === 'landing' ? 'App Dashboard' : 'Landing'}</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 text-xs font-medium transition-colors"
              title="Streak Freeze Tokens remaining"
            >
              <Snowflake className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="font-mono font-bold">{user.freezeTokensRemaining}</span>
              <span className="hidden sm:inline text-[11px] text-cyan-400/70">Freezes</span>
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-lg bg-[#12141c] hover:bg-[#161924] border border-[#1e2230] text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[#090a0f] text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {supabaseUser ? (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono"
                title={`Cloud Synced as ${supabaseUser.email}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synced</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all transform hover:scale-105"
                title="Sign in for multi-device sync"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-[#12141c] hover:bg-[#161924] border border-[#1e2230] text-slate-300 hover:text-white transition-colors"
              title="Settings & Freeze Engine"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2 p-1 rounded-full bg-[#12141c] border border-[#1e2230] hover:border-cyan-500/50 transition-colors"
            >
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/30"
              />
            </button>
          </div>

        </div>
      </header>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090a0f]/95 backdrop-blur-lg border-t border-[#1e2230] px-3 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
