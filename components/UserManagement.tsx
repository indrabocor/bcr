
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Users, Shield, UserCircle, Trash2, Key, AlertTriangle, X } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  
  // State for Custom Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username === username)) {
      alert('Username sudah terpakai!');
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password,
      role
    };

    onAddUser(newUser);
    setUsername('');
    setPassword('');
    setRole(UserRole.STAFF);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm sticky top-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <UserPlus size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Buat Akun Baru</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Username</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Username unik"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Password aman"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Tipe Akses</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ADMIN)}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all ${role === UserRole.ADMIN ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  AKUN UTAMA
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.STAFF)}
                  className={`py-3 rounded-2xl border text-xs font-bold transition-all ${role === UserRole.STAFF ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  AKUN KHUSUS
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
            >
              <UserPlus size={18} />
              Daftarkan User
            </button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-gray-400" size={20} />
              <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Daftar Pengguna Sistem</h3>
            </div>
            <span className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full font-bold text-gray-500">{users.length} User Aktif</span>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map(user => (
              <div key={user.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-110 ${user.role === UserRole.ADMIN ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{user.username}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      {user.role === UserRole.ADMIN ? (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Shield size={10} /> Akun Utama
                        </span>
                      ) : (
                        <span className="text-slate-400">Akun Khusus</span>
                      )}
                      {user.id === currentUser.id && (
                        <span className="text-gray-300 italic">(Anda)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {user.id !== currentUser.id && (
                  <button 
                    onClick={() => setUserToDelete(user)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Hapus Pengguna"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Konfirmasi Hapus</h3>
              <p className="text-slate-500 mb-8">
                Are you sure you want to delete this user? <br/>
                <span className="font-bold text-slate-900 mt-2 block bg-slate-100 py-2 rounded-xl">@{userToDelete.username}</span>
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
            <button 
              onClick={() => setUserToDelete(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
