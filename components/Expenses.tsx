
import React, { useState } from 'react';
import { Receipt, Plus, Trash2, X, AlertTriangle, Filter } from 'lucide-react';
import { Expense } from '../types';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ description: '', amount: 0, category: 'OTHER' as any });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({ ...formData, id: crypto.randomUUID(), timestamp: Date.now() });
    setShowAdd(false);
    setFormData({ description: '', amount: 0, category: 'OTHER' });
  };

  const categories = [
    { id: 'RENT', label: 'Sewa Tempat / Gedung' },
    { id: 'UTILITIES', label: 'Listrik, Air & Internet' },
    { id: 'SALARY', label: 'Gaji & Bonus Karyawan' },
    { id: 'SUPPLIES', label: 'Perlengkapan & ATK' },
    { id: 'MARKETING', label: 'Pemasaran & Iklan' },
    { id: 'OTHER', label: 'Biaya Lain-lain' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-950 flex items-center gap-3">
            <Receipt className="text-red-600" size={32} />
            Beban Operasional
          </h2>
          <p className="text-slate-600 font-bold">Catat pengeluaran kas dengan detail yang tajam dan akurat.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 hover:bg-red-700 transition-all active:scale-95">
          CATAT PENGELUARAN BARU
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-black tracking-widest border-b-2 border-slate-100">
              <tr>
                <th className="px-8 py-6">Tanggal</th>
                <th className="px-6 py-6">Kategori</th>
                <th className="px-6 py-6">Deskripsi</th>
                <th className="px-6 py-6 text-right">Jumlah</th>
                <th className="px-8 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {expenses.slice().reverse().map(e => (
                <tr key={e.id} className="hover:bg-red-50/30 group">
                  <td className="px-8 py-5 text-[11px] font-black text-slate-500 font-mono">{new Date(e.timestamp).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-black uppercase border border-red-100">
                      {categories.find(c => c.id === e.category)?.label || e.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-900 font-black text-sm">{e.description}</td>
                  <td className="px-6 py-5 text-right font-black text-red-600 text-lg">{formatCurrency(e.amount)}</td>
                  <td className="px-8 py-5 text-right"><button onClick={() => setShowConfirmDelete(e.id)} className="p-3 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={20} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-red-600 p-8 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tight">Input Beban Baru</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Kategori Beban</label>
                <select className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-red-600 focus:bg-white outline-none font-black text-slate-950" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Deskripsi Pengeluaran</label>
                <input type="text" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-red-600 focus:bg-white outline-none font-black text-slate-950 placeholder:text-slate-400" required placeholder="Contoh: Bayar Wi-Fi" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Jumlah Nominal (IDR)</label>
                <input type="number" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-red-600 focus:bg-white outline-none font-black text-slate-950 text-xl" required value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition-all">Simpan Beban Kas</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
