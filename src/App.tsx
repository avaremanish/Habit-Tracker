import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { TodayDashboard } from './components/dashboard/TodayDashboard';
import { UnifiedHabitGrid } from './components/grid/UnifiedHabitGrid';
import { HabitAnalyzer } from './components/analyzer/HabitAnalyzer';
import { GoalsView } from './components/goals/GoalsView';
import { TasksView } from './components/tasks/TasksView';
import { LandingPage } from './components/landing/LandingPage';

// Modals
import { HabitCreationModal } from './components/habits/HabitCreationModal';
import { HabitDetailModal } from './components/habits/HabitDetailModal';
import { GoalCreationModal } from './components/goals/GoalCreationModal';
import { TaskCreationModal } from './components/tasks/TaskCreationModal';
import { WeeklyReviewModal } from './components/reviews/WeeklyReviewModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setIsWeeklyReviewOpen, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
          {activeTab === 'today' && <TodayDashboard />}
          {activeTab === 'habits' && <UnifiedHabitGrid />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'goals' && <GoalsView />}
          {activeTab === 'insights' && <HabitAnalyzer />}
          {activeTab === 'landing' && <LandingPage />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1e2230] bg-[#090a0f]/90 py-8 px-4 text-center text-xs text-slate-500 font-mono space-y-2 mb-16 md:mb-0">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-300">CONSIST</span>
          <span>— Built for consistency, not distraction.</span>
        </div>
        <div className="flex justify-center space-x-4 text-[11px] text-slate-400 pt-1">
          <button onClick={() => setIsWeeklyReviewOpen(true)} className="hover:text-cyan-400 transition-colors">
            Sunday Weekly Review
          </button>
          <span>•</span>
          <span>Plan ➔ Execute ➔ Track ➔ Analyze ➔ Improve</span>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <HabitCreationModal />
      <HabitDetailModal />
      <GoalCreationModal />
      <TaskCreationModal />
      <WeeklyReviewModal />
      <SettingsModal />
      <NotificationDrawer />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
