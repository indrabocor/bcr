
import React, { useState, useMemo } from 'react';
import { User, UserRole, CashAdvance } from '../types';
import { UserPlus, Users, Shield, UserCircle, Trash2, Key, AlertTriangle, X, Wallet, ArrowUpRight, ArrowDownRight, Banknote } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  currentUser: User;
  cashAdvances: CashAdvance[];
  onCashAdvance: (transaction: CashAdvance) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser, currentUser, cashAdvances, onCashAdvance }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  
  // State for Custom Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [financeUser, setFinanceUser] = useState<User | null>(null);

  // Finance Modal States
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [transactionType, setTransactionType] = useState<'LOAN' | 'REPAYMENT'>('LOAN');

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

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

  const handleFinanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financeUser || amount <= 0) return;

    onCashAdvance({
      id: crypto.randomUUID(),
      userId: financeUser.id,
      userName: financeUser.username,
      timestamp: Date.now(),
      type: transactionType,
      amount: amount,
      notes: notes || (transactionType === 'LOAN' ? 'Pinjaman Karyawan' : 'Pelunasan Kasbon')
    });

    setAmount(0);
    setNotes('');
  };

  const userFinanceHistory = useMemo(() => {
    if (!financeUser) return [];
    return cashAdvances.filter(c => c.userId === financeUser.id).sort((a, b) => b.timestamp - a.timestamp);
  }, [cashAdvances, financeUser]);

  const userBalance = useMemo(() => {
    if (!financeUser) return 0;
    const loans = cashAdvances.filter(c => c.userId === financeUser.id && c.type === 'LOAN').reduce((sum, c) => sum + c.amount, 0);
    const repayments = cashAdvances.filter(c => c.userId === financeUser.id && c.type === 'REPAYMENT').reduce((sum, c) => sum + c.amount, 0);
    return loans - repayments;
  }, [cashAdvances, financeUser]);

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
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFinanceUser(user)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-indigo-100"
                  >
                    <Wallet size={14} /> Kasbon
                  </button>

                  {user.id !== currentUser.id && (
                    <button 
                      onClick={() => setUserToDelete(user)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
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

      {/* Employee Finance (Kasbon) Modal */}
      {financeUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Banknote size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Manajemen Kasbon</h3>
                    <p className="text-sm opacity-70">Karyawan: {financeUser.username}</p>
                  </div>
               </div>
               <button onClick={() => setFinanceUser(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {/* Balance Card */}
               <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-600/20 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Total Hutang / Kasbon</p>
                    <h2 className="text-3xl font-black">{formatCurrency(userBalance)}</h2>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Wallet size={24} />
                  </div>
               </div>

               {/* Transaction Form */}
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                  <div className="flex gap-2 mb-4 p-1 bg-white rounded-xl border border-slate-200">
                     <button 
                       type="button" 
                       onClick={() => setTransactionType('LOAN')}
                       className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${transactionType === 'LOAN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                     >
                       Beri Pinjaman (OUT)
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setTransactionType('REPAYMENT')}
                       className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${transactionType === 'REPAYMENT' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                     >
                       Terima Bayaran (IN)
                     </button>
                  </div>

                  <form onSubmit={handleFinanceSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Nominal (IDR)</label>
                      <input 
                        type="number" 
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-lg font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        value={amount}
                        onChange={e => setAmount(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Catatan / Keterangan</label>
                      <input 
                        type="text" 
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                        placeholder={transactionType === 'LOAN' ? "Keperluan pribadi, dsb..." : "Potong gaji bulan ini..."}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${transactionType === 'LOAN' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'}`}
                    >
                      {transactionType === 'LOAN' ? 'Catat Pengeluaran Kas' : 'Catat Pemasukan Kas'}
                    </button>
                  </form>
               </div>

               {/* History List */}
               <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Riwayat Transaksi</h4>
                  <div className="space-y-2">
                    {userFinanceHistory.length > 0 ? userFinanceHistory.map(item => (
                      <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${item.type === 'LOAN' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                  {item.type === 'LOAN' ? 'PINJAMAN' : 'BAYAR'}
                               </span>
                               <span className="text-[10px] font-mono text-slate-400">
                                 {new Date(item.timestamp).toLocaleDateString('id-ID')}
                               </span>
                            </div>
                            <p className="text-xs font-bold text-slate-700">{item.notes}</p>
                         </div>
                         <div className={`font-black text-sm flex items-center gap-1 ${item.type === 'LOAN' ? 'text-red-600' : 'text-green-600'}`}>
                            {item.type === 'LOAN' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {formatCurrency(item.amount)}
                         </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-300">
                         <Wallet size={32} className="mx-auto mb-2 opacity-30" />
                         <p className="text-xs">Belum ada riwayat kasbon</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
