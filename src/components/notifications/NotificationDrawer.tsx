import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Bell, Flame, Clock, Sparkles, Check, Trash2 } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications 
  } = useApp();

  return (
    <Modal
      isOpen={isNotificationsOpen}
      onClose={() => setIsNotificationsOpen(false)}
      title="Notifications & Smart Reminders"
      subtitle="Calm, non-distracting behavioral nudges."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {notifications.length > 0 ? (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-3.5 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                  n.read 
                    ? 'bg-[#090a0f] border-[#1e2230] opacity-60' 
                    : 'bg-[#161924] border-cyan-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{n.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            No active notifications.
          </div>
        )}

        <div className="pt-3 border-t border-[#1e2230] flex justify-between items-center text-xs">
          <button
            onClick={clearAllNotifications}
            className="text-slate-500 hover:text-slate-300 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
          
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-[#090a0f] font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
