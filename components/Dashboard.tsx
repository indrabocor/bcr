
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle,
  Bell,
  AlertCircle,
  Smartphone,
  Activity,
  Zap,
  Cpu,
  Layers,
  Globe
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Sale, Expense, Product, ServiceRecord, ServiceStatus } from '../types';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  services: ServiceRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, products, services }) => {
  const totalRevenue = useMemo(() => {
    const salesTotal = sales.reduce((sum, s) => sum + s.total, 0);
    const servicesTotal = services
      .filter(s => s.status === ServiceStatus.PICKED_UP)
      .reduce((sum, s) => sum + s.totalCost, 0);
    return salesTotal + servicesTotal;
  }, [sales, services]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const netProfit = totalRevenue - totalExpenses;
  const lowStockCount = useMemo(() => products.filter(p => p.stock < 10).length, [products]);
  const activeServices = useMemo(() => services.filter(s => s.status !== ServiceStatus.PICKED_UP && s.status !== ServiceStatus.CANCELLED).length, [services]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySales = sales
        .filter(s => new Date(s.timestamp).toISOString().split('T')[0] === date)
        .reduce((sum, s) => sum + s.total, 0);
      const dayServices = services
        .filter(s => s.status === ServiceStatus.PICKED_UP && new Date(s.pickedUpTimestamp || 0).toISOString().split('T')[0] === date)
        .reduce((sum, s) => sum + s.totalCost, 0);
      const dayExpenses = expenses
        .filter(e => new Date(e.timestamp).toISOString().split('T')[0] === date)
        .reduce((sum, e) => sum + e.amount, 0);
      
      const revenue = daySales + dayServices;
      return {
        date: date.substring(5),
        revenue: revenue,
        expenses: dayExpenses,
        profit: revenue - dayExpenses
      };
    });
  }, [sales, expenses, services]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 relative pb-20">
      {/* Hologram Overlay Styles */}
      <style>{`
        @keyframes scan {
          0% { top: -100%; }
          100% { top: 200%; }
        }
        @keyframes pulse-neon {
          0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.4), inset 0 0 5px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.7), inset 0 0 15px rgba(59, 130, 246, 0.4); }
        }
        @keyframes grid-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 30px 30px; }
        }
        .bg-hologram-grid {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
          animation: grid-scroll 20s linear infinite;
        }
        .hud-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(59, 130, 246, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .hud-card:hover {
          border-color: rgba(59, 130, 246, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -10px rgba(59, 130, 246, 0.15);
        }
        .scanline {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.5), transparent);
          animation: scan 4s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        .neon-accent {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>

      {/* Decorative Background for Dashboard Context */}
      <div className="fixed inset-0 bg-hologram-grid pointer-events-none -z-10 opacity-60"></div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-950 flex items-center gap-3">
            <Activity className="text-blue-600 neon-accent" size={32} />
            Command Center
          </h2>
          <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] mt-1">Live Business Telemetry & System Status</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
             <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">Network Secure</span>
          </div>
          <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
             <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Data Synced</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue HUD Card */}
        <div className="hud-card p-7 rounded-[2.5rem] shadow-sm">
          <div className="scanline"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Revenue</p>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/30">
              <Zap size={20} className="neon-accent" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 w-3/4 animate-pulse"></div>
            </div>
            <span className="text-[9px] font-black text-blue-600">75% Target</span>
          </div>
        </div>

        {/* Net Profit HUD Card */}
        <div className="hud-card p-7 rounded-[2.5rem] shadow-sm border-l-4 border-l-indigo-500">
          <div className="scanline" style={{ animationDelay: '1s' }}></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Net Profit</p>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">{formatCurrency(netProfit)}</h3>
            </div>
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
              <Cpu size={20} className="neon-accent" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
             <div className="flex items-center gap-1 text-green-600">
                <ArrowUpRight size={14} strokeWidth={3} />
                <span className="text-[10px] font-black">+12.4%</span>
             </div>
             <div className="text-[9px] font-bold text-slate-400 uppercase">vs Last Month</div>
          </div>
        </div>

        {/* Service Active HUD Card */}
        <div className="hud-card p-7 rounded-[2.5rem] shadow-sm">
          <div className="scanline" style={{ animationDelay: '2s' }}></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Services</p>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">{activeServices} Units</h3>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl text-blue-400 shadow-lg shadow-slate-950/20">
              <Layers size={20} className="neon-accent" />
            </div>
          </div>
          <div className="mt-6">
            <div className="grid grid-cols-5 gap-1">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className={`h-1.5 rounded-full ${i <= 3 ? 'bg-blue-500' : 'bg-slate-100'}`}></div>
               ))}
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Resource Utilization: High</p>
          </div>
        </div>

        {/* Stock Alert HUD Card */}
        <div className={`hud-card p-7 rounded-[2.5rem] shadow-sm border-2 ${lowStockCount > 0 ? 'border-orange-500/30' : 'border-green-500/30'}`}>
          <div className="scanline" style={{ animationDelay: '1.5s' }}></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Inventory Alert</p>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">{lowStockCount} Items</h3>
            </div>
            <div className={`p-3 rounded-2xl shadow-lg transition-colors ${lowStockCount > 0 ? 'bg-orange-600 text-white shadow-orange-600/30' : 'bg-green-600 text-white shadow-green-600/30'}`}>
              <AlertCircle size={20} className="neon-accent" />
            </div>
          </div>
          <div className="mt-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 ${lowStockCount > 0 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
               <Globe size={12} className={lowStockCount > 0 ? 'animate-spin-slow' : ''} />
               <span className="text-[9px] font-black uppercase tracking-widest">{lowStockCount > 0 ? 'Immediate Restock' : 'Supply Optimal'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 hud-card p-8 rounded-[3rem] shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Financial Telemetry</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">7-Day Transaction Period</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded bg-blue-600"></div>
                   <span className="text-[9px] font-black text-slate-500 uppercase">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded bg-indigo-200"></div>
                   <span className="text-[9px] font-black text-slate-500 uppercase">Profit</span>
                </div>
             </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                   dataKey="date" 
                   stroke="#94a3b8" 
                   fontSize={10} 
                   tickLine={false} 
                   axisLine={false} 
                   fontFamily="monospace"
                   fontWeight="bold"
                />
                <YAxis 
                   stroke="#94a3b8" 
                   fontSize={10} 
                   tickLine={false} 
                   axisLine={false} 
                   tickFormatter={(v) => `${v/1000}k`} 
                   fontFamily="monospace"
                   fontWeight="bold"
                />
                <Tooltip 
                  cursor={{ stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                    boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.15)',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ 
                    fontSize: '11px', 
                    fontWeight: '900', 
                    textTransform: 'uppercase',
                    fontFamily: 'sans-serif'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={2000}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Logs / Low Stock Hud */}
        <div className="hud-card p-8 rounded-[3rem] shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-100 rounded-lg">
                <ShoppingCart size={18} className="text-slate-900" />
             </div>
             <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Inventory Health</h3>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
             {products.filter(p => p.stock < 15).length > 0 ? (
               products.filter(p => p.stock < 15).slice(0, 6).map(p => (
                 <div key={p.id} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div>
                       <p className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[120px]">{p.name}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs font-black ${p.stock < 10 ? 'text-red-600' : 'text-orange-600'}`}>{p.stock} Units</span>
                       <div className="h-1 w-8 bg-slate-200 rounded-full mt-1 ml-auto">
                          <div className={`h-full rounded-full ${p.stock < 10 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${(p.stock/20)*100}%` }}></div>
                       </div>
                    </div>
                 </div>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
                  <Package size={48} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">All Stocks Healthy</p>
               </div>
             )}
          </div>
          
          <button className="w-full py-4 mt-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
             Generate Full Inventory Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
