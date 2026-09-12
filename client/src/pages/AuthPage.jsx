import React, { useState } from 'react';
import { Layers, Sparkles, ArrowRight, Lock, Mail, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authService.login({ email, password });
      } else {
        res = await authService.register({ name, email, password });
      }

      if (res.data.success) {
        login(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F6F2] dark:bg-[#100C0D] text-[#100C0D] dark:text-[#E3DCD2] flex flex-col md:flex-row transition-colors">
      {/* Floating Theme Toggle in top-right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle showLabel={true} />
      </div>

      {/* Left Feature Showcase Banner */}
      <div className="flex-1 bg-gradient-to-br from-[#013328] via-[#02261E] to-[#100C0D] text-[#FAF8F5] p-8 sm:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#261E20] transition-colors">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#CC8B65] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#CC8B65]/30">
              S
            </div>
            <span className="text-xl font-black tracking-tight text-white">SyncSpace</span>
          </div>

          <div className="mt-16 sm:mt-24 max-w-lg space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#CC8B65]/20 border border-[#CC8B65]/40 text-[#E7C3AC] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#CC8B65]" />
              <span>Real-Time Multi-User Workspace</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Where Notion docs meet Miro whiteboards.
            </h1>
            <p className="text-base text-[#E3DCD2]/80 leading-relaxed">
              Collaborate live with your teammates. See multiplayer cursors dance across the screen in real-time with zero lag.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3 text-sm text-[#E3DCD2]">
                <CheckCircle2 className="w-5 h-5 text-[#CC8B65] flex-shrink-0" />
                <span>Live multi-user cursor tracking and presence avatars</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-[#E3DCD2]">
                <CheckCircle2 className="w-5 h-5 text-[#CC8B65] flex-shrink-0" />
                <span>Notion-style block notes (Headings, Checklists, Code, Quotes)</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-[#E3DCD2]">
                <CheckCircle2 className="w-5 h-5 text-[#CC8B65] flex-shrink-0" />
                <span>Miro-style visual whiteboard with sticky notes and cards</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-[#E3DCD2]">
                <CheckCircle2 className="w-5 h-5 text-[#CC8B65] flex-shrink-0" />
                <span>Instant team workspace sharing with invite codes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs text-[#E3DCD2]/60 font-medium">
          Built with MERN (MongoDB, Express, React, Node) + Socket.io & Tailwind CSS
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-16 bg-white dark:bg-[#151011] transition-colors">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#100C0D] dark:text-[#E3DCD2] tracking-tight">
              {isLogin ? 'Welcome back to SyncSpace' : 'Create your SyncSpace account'}
            </h2>
            <p className="mt-2 text-sm text-[#786B65] dark:text-[#8C7E77]">
              {isLogin 
                ? 'Sign in to jump straight into your team workspace.' 
                : 'Get started in seconds with real-time collaborative docs.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 text-xs font-medium text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#786B65] dark:text-[#8C7E77] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#786B65] dark:text-[#8C7E77] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alice Johnson"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1E1719] border border-[#E3DCD2] dark:border-[#2E2325] rounded-xl text-sm text-[#100C0D] dark:text-[#E3DCD2] placeholder-[#A0938A] focus:outline-none focus:ring-2 focus:ring-[#CC8B65]/30 focus:border-[#CC8B65] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#786B65] dark:text-[#8C7E77] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#786B65] dark:text-[#8C7E77] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1E1719] border border-[#E3DCD2] dark:border-[#2E2325] rounded-xl text-sm text-[#100C0D] dark:text-[#E3DCD2] placeholder-[#A0938A] focus:outline-none focus:ring-2 focus:ring-[#CC8B65]/30 focus:border-[#CC8B65] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#786B65] dark:text-[#8C7E77] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#786B65] dark:text-[#8C7E77] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-[#1E1719] border border-[#E3DCD2] dark:border-[#2E2325] rounded-xl text-sm text-[#100C0D] dark:text-[#E3DCD2] placeholder-[#A0938A] focus:outline-none focus:ring-2 focus:ring-[#CC8B65]/30 focus:border-[#CC8B65] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#CC8B65] hover:bg-[#B8744C] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#CC8B65]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-xs text-[#CC8B65] hover:text-[#B8744C] font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

