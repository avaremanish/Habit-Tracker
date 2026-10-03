import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { 
  signInWithMagicLink, 
  signInWithPassword, 
  signUpWithPassword 
} from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'magiclink'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'magiclink') {
        const { error } = await signInWithMagicLink(email.trim());
        if (error) throw error;
        setMessage({
          type: 'success',
          text: `Magic link dispatched! Check ${email} to sign in securely.`,
        });
      } else if (mode === 'signup') {
        const { error } = await signUpWithPassword(email.trim(), password, fullName.trim());
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Account created successfully! Check your email to confirm registration.',
        });
        if (onAuthSuccess) onAuthSuccess();
      } else {
        const { error } = await signInWithPassword(email.trim(), password);
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Authenticated successfully! Syncing cloud workspace...',
        });
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Authentication failed. Please verify credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'signup' 
          ? 'Create Beta Account' 
          : mode === 'magiclink' 
          ? 'Passwordless Magic Link' 
          : 'Sign In to CONSIST'
      }
      subtitle="Multi-device real-time sync with Row Level Security."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Supabase Status Indicator Banner */}
        {!configured && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Supabase Keys Not Detected</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Add <code className="text-amber-300 font-mono">VITE_SUPABASE_URL</code> and <code className="text-amber-300 font-mono">VITE_SUPABASE_ANON_KEY</code> to your <code className="font-mono">.env</code> file to activate cloud sync. Currently running in local disk mode.
            </p>
          </div>
        )}

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Auth Mode Tabs */}
        <div className="flex bg-[#090a0f] p-1 rounded-xl border border-[#1e2230]">
          <button
            type="button"
            onClick={() => { setMode('signin'); setMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin' ? 'bg-[#1e2230] text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup' ? 'bg-[#1e2230] text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('magiclink'); setMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'magiclink' ? 'bg-[#1e2230] text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Manish Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {mode !== 'magiclink' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-mono uppercase text-slate-400">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !configured}
            className={`w-full py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
              configured
                ? 'bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] shadow-cyan-500/25 transform hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#090a0f] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signup' 
                    ? 'Create Account' 
                    : mode === 'magiclink' 
                    ? 'Send Magic Link' 
                    : 'Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & RLS Footer Note */}
        <div className="pt-2 border-t border-[#1e2230] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Encrypted with Postgres RLS</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </Modal>
  );
};
