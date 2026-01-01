
import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, UserCircle, Lock, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  existingUsers: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, existingUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = existingUsers.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Username atau password salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Fixed: removed broken duplicate tag fragment and corrected the syntax */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/20">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BCR ERP</h1>
          <p className="text-slate-400">Masuk ke sistem manajemen bisnis</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500 outline-none transition-all"
                placeholder="Masukkan password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group mt-4"
          >
            <LogIn size={20} />
            Masuk Ke Dashboard
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-500 text-xs italic">
            Hubungi Akun Utama (Admin) untuk pembuatan akun baru.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
