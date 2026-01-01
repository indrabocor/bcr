
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldAlert, UserPlus, Lock, UserCircle } from 'lucide-react';

interface InitialSetupProps {
  onComplete: (admin: User) => void;
}

const InitialSetup: React.FC<InitialSetupProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdmin: User = {
      id: 'admin-' + Date.now(),
      username,
      password,
      role: UserRole.ADMIN
    };
    onComplete(newAdmin);
    alert('Akun Admin Utama berhasil dibuat! Silakan login.');
  };

  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-blue-100 text-blue-600 mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Awal</h1>
          <p className="text-gray-500 text-sm mt-2">
            Belum ada user terdaftar. Silakan buat akun <strong>Admin Utama</strong> pertama Anda untuk mulai menggunakan sistem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username Admin</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Contoh: bos_bcr"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password Admin</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Masukkan password aman"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            Buat Akun Admin Pertama
          </button>
        </form>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-[10px] text-blue-700 leading-relaxed italic text-center">
            Catatan: Akun ini akan memiliki akses penuh ke seluruh fitur termasuk Manajemen User dan Laporan Keuangan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;
