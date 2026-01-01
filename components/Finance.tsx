
import React, { useState, useMemo } from 'react';
import { BookText, TrendingUp, TrendingDown, Landmark, Printer, Calendar, Filter, RefreshCcw, Wallet, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LedgerEntry, Sale, Expense } from '../types';

interface FinanceProps {
  ledger: LedgerEntry[];
  sales: Sale[];
  expenses: Expense[];
}

const Finance: React.FC<FinanceProps> = ({ ledger, sales, expenses }) => {
  // Date Filter State
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0] // Today
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Filter Logic
  const filteredData = useMemo(() => {
    const startTime = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);

    const fLedger = ledger.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
    const fSales = sales.filter(s => s.timestamp >= startTime && s.timestamp <= endTime);
    const fExpenses = expenses.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);

    return { fLedger, fSales, fExpenses };
  }, [ledger, sales, expenses, dateRange]);

  const { fLedger, fSales, fExpenses } = filteredData;

  // Summaries based on filtered data
  const periodRevenue = fSales.reduce((sum, s) => sum + s.total, 0);
  const periodExpenses = fExpenses.reduce((sum, e) => sum + e.amount, 0);
  const periodNetProfit = periodRevenue - periodExpenses;
  
  // Saldo Kas is usually a running total (cumulative), but for this report we show period movement
  const cashMovement = fLedger
    .filter(e => e.account === 'KAS')
    .reduce((sum, e) => sum + e.debit - e.credit, 0);

  // All-time balance for the "Balance" card to show actual current cash
  const currentTotalBalance = ledger
    .filter(e => e.account === 'KAS')
    .reduce((sum, e) => sum + e.debit - e.credit, 0);

  const handlePrint = () => {
    window.print();
  };

  const resetFilter = () => {
    setDateRange({
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Date Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Filter size={20} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">Filter Laporan</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tentukan periode waktu data keuangan</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-1.5 rounded-2xl flex-1 md:flex-none">
            <div className="flex items-center gap-2 px-3">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Dari</span>
            </div>
            <input 
              type="date" 
              className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-3"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 p-1.5 rounded-2xl flex-1 md:flex-none">
            <div className="flex items-center gap-2 px-3">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Ke</span>
            </div>
            <input 
              type="date" 
              className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-3"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>

          <button 
            onClick={resetFilter}
            className="p-3 bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-95"
            title="Reset Filter ke Bulan Ini"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Main Cash Balance (All Time) */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-7 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-500">
            <Landmark size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5 opacity-80">
              <Landmark size={20} className="text-blue-400" />
              <h4 className="font-bold text-[10px] uppercase tracking-widest">Saldo Kas (Current)</h4>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">{formatCurrency(currentTotalBalance)}</h2>
            <div className="flex items-center gap-1.5">
              <div className={`p-1 rounded-md ${cashMovement >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {cashMovement >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider ${cashMovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Mutasi: {formatCurrency(Math.abs(cashMovement))}
              </span>
            </div>
          </div>
        </div>

        {/* Period Revenue */}
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              <TrendingUp size={22} />
            </div>
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-gray-500">Pendapatan Periode</h4>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">{formatCurrency(periodRevenue)}</h2>
          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{fSales.length} Transaksi Terdeteksi</p>
        </div>

        {/* Period Expenses */}
        <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors">
              <TrendingDown size={22} />
            </div>
            <h4 className="font-bold text-[10px] uppercase tracking-widest text-gray-500">Beban Periode</h4>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">{formatCurrency(periodExpenses)}</h2>
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{fExpenses.length} Pengeluaran Tercatat</p>
        </div>

        {/* Period Net Profit */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-7 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-500">
            <Coins size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5 opacity-80">
              <Wallet size={20} className="text-blue-300" />
              <h4 className="font-bold text-[10px] uppercase tracking-widest">Laba Bersih Periode</h4>
            </div>
            <h2 className="text-2xl font-black tracking-tight mb-2">{formatCurrency(periodNetProfit)}</h2>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl inline-flex items-center gap-2 border border-white/10">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></div>
               <span className="text-[9px] font-black uppercase tracking-widest">Profit Margin: {periodRevenue > 0 ? ((periodNetProfit/periodRevenue)*100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20">
              <BookText size={22} />
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">Buku Besar / Journal Ledger</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Menampilkan {fLedger.length} Entri untuk Rentang Tanggal Terpilih
              </p>
            </div>
          </div>
          <button 
            onClick={handlePrint}
            className="no-print flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 px-6 py-3 rounded-2xl text-[11px] font-black transition-all shadow-sm active:scale-95 uppercase tracking-wider"
          >
            <Printer size={16} />
            CETAK LAPORAN
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/30 text-gray-400 uppercase font-black text-[10px] tracking-[0.15em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-6">Waktu Transaksi</th>
                <th className="px-6 py-6">Akun Entri</th>
                <th className="px-6 py-6">Keterangan / Deskripsi</th>
                <th className="px-6 py-6 text-right">Debit (+)</th>
                <th className="px-8 py-6 text-right">Kredit (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {fLedger.slice().reverse().map(entry => (
                <tr key={entry.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-8 py-5 text-[11px] font-mono text-gray-400">
                    {new Date(entry.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-white text-slate-600 px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border border-slate-200 group-hover:border-blue-300 transition-colors">
                      {entry.account}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-700 font-bold text-sm leading-tight max-w-xs">{entry.description}</td>
                  <td className="px-6 py-5 text-right">
                    {entry.debit > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-green-600 font-black">{formatCurrency(entry.debit)}</span>
                        <div className="h-0.5 w-4 bg-green-500/20 rounded-full mt-1"></div>
                      </div>
                    ) : (
                      <span className="text-gray-200 font-mono">-</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    {entry.credit > 0 ? (
                      <div className="flex flex-col items-end">
                        <span className="text-red-600 font-black">{formatCurrency(entry.credit)}</span>
                        <div className="h-0.5 w-4 bg-red-500/20 rounded-full mt-1"></div>
                      </div>
                    ) : (
                      <span className="text-gray-200 font-mono">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {fLedger.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                        <BookText size={40} className="opacity-10" />
                      </div>
                      <p className="font-bold text-gray-600">Jurnal Jurnal Kosong</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-[250px]">Tidak ada pergerakan kas atau jurnal transaksi pada periode yang dipilih.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {fLedger.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                <tr className="font-black text-slate-800 uppercase tracking-widest text-[10px]">
                  <td colSpan={3} className="px-8 py-7 text-right">Rekapitulasi Mutasi Jurnal:</td>
                  <td className="px-6 py-7 text-right text-green-600 text-base">
                    {formatCurrency(fLedger.reduce((sum, e) => sum + e.debit, 0))}
                  </td>
                  <td className="px-8 py-7 text-right text-red-600 text-base">
                    {formatCurrency(fLedger.reduce((sum, e) => sum + e.credit, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
