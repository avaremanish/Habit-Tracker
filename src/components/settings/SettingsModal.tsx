import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Snowflake, RefreshCw, Database, Download, Upload, Cloud, LogOut, LogIn, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    user, 
    updateUser, 
    freezes, 
    resetDemoData,
    isDbServerConnected,
    exportBackupData,
    importBackupData,
    supabaseUser,
    isSupabaseConnected,
    setIsAuthModalOpen,
    signOut,
    migrateToCloud
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [migrating, setMigrating] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupData(content);
        if (ok) {
          alert("Backup data successfully restored!");
        } else {
          alert("Failed to parse backup JSON file.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleMigrate = async () => {
    setMigrating(true);
    const res = await migrateToCloud();
    setMigrating(false);
    alert(res.message);
  };

  return (
    <Modal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      title="Settings & Cloud Sync"
      subtitle="Manage profile, Postgres database sync, and streak protection rules."
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        
        {/* Profile & Auth Card */}
        <div className="p-4 bg-[#090a0f] border border-[#1e2230] rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/40"
            />
            <div>
              <h4 className="font-bold text-white text-sm">{user.name}</h4>
              <p className="text-xs text-slate-400 font-mono">
                {supabaseUser ? supabaseUser.email : user.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {supabaseUser ? (
              <button
                type="button"
                onClick={signOut}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Supabase Multi-Device Cloud Sync Card */}
        <div className="p-5 bg-[#161924] border border-[#1e2230] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Cloud className="w-4 h-4" />
              <span>Multi-Device Cloud Sync (Supabase)</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
              isSupabaseConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {isSupabaseConnected ? 'POSTGRES RLS ACTIVE' : 'LOCAL OFFLINE BUFFER'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isSupabaseConnected 
              ? `Connected as ${supabaseUser.email}. Check-ins and habits synchronize across your phones, tablets, and laptops in real-time.` 
              : 'Sign in with your beta account to enable real-time multi-device sync, point-in-time recovery, and cloud backups.'}
          </p>

          {supabaseUser && (
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                disabled={migrating}
                onClick={handleMigrate}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{migrating ? 'Migrating...' : 'Migrate Local Data to Cloud'}</span>
              </button>
              <span className="text-[11px] text-slate-400 font-mono">
                Idempotent check-ins
              </span>
            </div>
          )}
        </div>

        {/* Local Database Persistence Card */}
        <div className="p-5 bg-[#161924] border border-[#1e2230] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>Local Database Persistence</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
              isDbServerConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            }`}>
              {isDbServerConnected ? 'SERVER DISK persistence (data/db.json)' : 'CLIENT INDEXEDDB / LOCALSTORAGE'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your daily habit updates, mindset ratings, tasks, and historical logs are automatically saved locally on your computer in <code className="text-cyan-300 font-mono">data/db.json</code>. You will never lose previous days.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={exportBackupData}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#090a0f] hover:bg-[#1a1d29] border border-[#1e2230] text-xs font-semibold text-cyan-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#090a0f] hover:bg-[#1a1d29] border border-[#1e2230] text-xs font-semibold text-slate-300 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Streak Freeze Engine Config */}
        <div className="p-5 bg-[#161924] border border-[#1e2230] rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Snowflake className="w-4 h-4 animate-pulse" />
              <span>Streak Freeze Engine</span>
            </div>
            <span className="text-xs font-mono font-extrabold text-cyan-300">
              ❄️ {user.freezeTokensRemaining} / {user.maxFreezeTokens} Available
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Protect your momentum when life gets in the way. Travel, rest days, or unexpected events don't have to erase months of discipline.
          </p>

          {/* Auto-freeze Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1e2230]">
            <div>
              <span className="text-xs font-semibold text-white block">Auto-Apply Freeze Tokens</span>
              <span className="text-[10px] text-slate-400">Automatically preserve streak when missing a scheduled day</span>
            </div>
            <input
              type="checkbox"
              checked={user.autoFreezeEnabled}
              onChange={(e) => updateUser({ autoFreezeEnabled: e.target.checked })}
              className="rounded border-slate-700 bg-[#090a0f] text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Freeze History */}
          <div className="pt-3 border-t border-[#1e2230] space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Freeze History Log:</span>
            {freezes.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {freezes.map((f) => (
                  <div key={f.id} className="flex justify-between text-xs p-2 rounded bg-[#090a0f] border border-[#1e2230]">
                    <span className="text-slate-300">{f.reason || 'Travel / Rest'}</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{f.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No freezes used yet.</span>
            )}
          </div>
        </div>

        {/* System Reset Button */}
        <div className="pt-4 border-t border-[#1e2230] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Reset all habit tracking data to initial October 1st state?")) {
                resetDemoData();
                setIsSettingsOpen(false);
              }
            }}
            className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
};
