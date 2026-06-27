import React, { useState } from 'react';
import { LogIn, Lock, AlertCircle, Shield, User, KeyRound, CheckCircle } from 'lucide-react';

const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;
    if (hostname.includes('vercel.app')) {
      return '/api';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api';
    }
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:3001/api`;
    }
    return '/api';
  }
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

export const LoginView = ({ onLogin, studentInfoData = [] }) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async () => {
    const id = credential.trim();
    const pass = password.trim();

    if (!id || !pass) {
      setError('Please enter your ID and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: id, password: pass })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Welcome, ${data.name}!`);
        setTimeout(() => {
          onLogin(data.role, data.roll || data.name, data.email);
          setIsLoading(false);
        }, 800);
      } else {
        const err = await res.json();
        setError(err.error || 'Invalid credentials. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network connection failed. Please verify the server is running.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen font-['Times_New_Roman',_serif] relative overflow-hidden bg-gray-50 flex items-center justify-center p-4">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-100/50 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-teal-50/50 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_20px_50px_rgba(16,185,129,0.1)] p-10 space-y-7 overflow-hidden relative">
          {/* Subtle Glow inside the card */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>

          {/* Header */}
          <div className="text-center space-y-3 relative">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Shield className="w-9 h-9 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-green-800 tracking-tight">
                AID-H Academic Portal
              </h1>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                Secure Single Sign-On
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="credential" className="block text-xs font-bold uppercase tracking-wider text-emerald-700 ml-1">
                ID / Roll No / Email / Mobile
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="credential"
                  value={credential}
                  onChange={(e) => { setCredential(e.target.value); setError(''); setSuccessMsg(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Admin ID / Roll No / Email / Phone"
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-emerald-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); setSuccessMsg(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 font-semibold"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-300 font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="flex items-center gap-3 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-300 font-semibold">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!credential || !password || isLoading}
            className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group ${credential && password && !isLoading
              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-emerald-900/40 text-xs font-semibold tracking-wide uppercase">
            © K12AIDHA Student Management
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="w-8 h-[1px] bg-emerald-900/10"></span>
            <div className="flex items-center gap-1.5 text-emerald-800/30 text-[10px] font-bold tracking-widest uppercase">
              <Lock className="w-3 h-3" />
              <span>Encrypted Session</span>
            </div>
            <span className="w-8 h-[1px] bg-emerald-900/10"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
