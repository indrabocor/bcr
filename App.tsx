
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Receipt, 
  BookText, 
  BrainCircuit, 
  Menu, 
  X,
  ChevronRight,
  ShieldCheck,
  Users,
  Smartphone
} from 'lucide-react';
import { AppView, Product, Sale, Expense, StockLog, LedgerEntry, User, UserRole, ServiceRecord, ServiceStatus, Customer } from './types';
import { INITIAL_PRODUCTS, TAX_RATE } from './constants';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Expenses from './components/Expenses';
import Finance from './components/Finance';
import AIInsights from './components/AIInsights';
import UserManagement from './components/UserManagement';
import ServiceManagement from './components/ServiceManagement';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Hardcoded Admin User (Login System Removed)
  const currentUser: User = {
    id: 'admin-fixed',
    username: 'Administrator',
    role: UserRole.ADMIN
  };

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('erp_users');
    return saved ? JSON.parse(saved) : [currentUser];
  });

  // States for Database
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('erp_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('erp_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [services, setServices] = useState<ServiceRecord[]>(() => {
    const saved = localStorage.getItem('erp_services');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('erp_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem('erp_stock_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('erp_ledger');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
    localStorage.setItem('erp_sales', JSON.stringify(sales));
    localStorage.setItem('erp_services', JSON.stringify(services));
    localStorage.setItem('erp_expenses', JSON.stringify(expenses));
    localStorage.setItem('erp_stock_logs', JSON.stringify(stockLogs));
    localStorage.setItem('erp_ledger', JSON.stringify(ledger));
    localStorage.setItem('erp_users', JSON.stringify(users));
    localStorage.setItem('erp_customers', JSON.stringify(customers));
  }, [products, sales, services, expenses, stockLogs, ledger, users, customers]);

  // Handler Actions
  const handleNewSale = (sale: Sale) => {
    setSales(prev => [...prev, sale]);
    
    setProducts(prev => prev.map(p => {
      const item = sale.items.find(i => i.productId === p.id);
      if (item) return { ...p, stock: p.stock - item.quantity };
      return p;
    }));

    const logs: StockLog[] = sale.items.map(item => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      timestamp: Date.now(),
      type: 'OUT',
      quantity: item.quantity,
      reason: `Penjualan ${sale.id}`
    }));
    setStockLogs(prev => [...prev, ...logs]);

    const ledgerEntries: LedgerEntry[] = [
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: `Penjualan ${sale.id}`,
        debit: sale.total,
        credit: 0,
        account: 'KAS'
      },
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: `Pendapatan Penjualan ${sale.id}`,
        debit: 0,
        credit: sale.subtotal,
        account: 'PENJUALAN'
      },
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: `Pajak Penjualan ${sale.id}`,
        debit: 0,
        credit: sale.tax,
        account: 'HUTANG_PAJAK'
      }
    ];
    setLedger(prev => [...prev, ...ledgerEntries]);
  };

  const handleUpdateService = (updated: ServiceRecord) => {
    const oldService = services.find(s => s.id === updated.id);
    setServices(prev => prev.map(s => s.id === updated.id ? updated : s));

    // LOGIKA PEMBAYARAN: Dari COMPLETED ke PICKED_UP
    if (oldService?.status !== ServiceStatus.PICKED_UP && updated.status === ServiceStatus.PICKED_UP) {
      const partsTotal = updated.partsUsed.reduce((sum, item) => sum + item.total, 0);
      
      const ledgerEntries: LedgerEntry[] = [
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          description: `Pembayaran Service: ${updated.customerName} - ${updated.deviceModel}`,
          debit: updated.totalCost,
          credit: 0,
          account: 'KAS'
        },
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          description: `Pendapatan Jasa Service: ${updated.id}`,
          debit: 0,
          credit: updated.serviceFee,
          account: 'PENDAPATAN_JASA'
        }
      ];

      if (partsTotal > 0) {
        ledgerEntries.push({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          description: `Pendapatan Suku Cadang Service: ${updated.id}`,
          debit: 0,
          credit: partsTotal,
          account: 'PENJUALAN'
        });
      }

      setLedger(prev => [...prev, ...ledgerEntries]);

      updated.partsUsed.forEach(part => {
        handleStockAdjustment(part.productId, 'OUT', part.quantity, `Service HP ${updated.id}`);
      });
    }

    // LOGIKA REFUND: Dari PICKED_UP ke REFUNDED
    if (oldService?.status === ServiceStatus.PICKED_UP && updated.status === ServiceStatus.REFUNDED) {
      const partsTotal = updated.partsUsed.reduce((sum, item) => sum + item.total, 0);
      
      const refundLedger: LedgerEntry[] = [
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          description: `PENGEMBALIAN BIAYA (REFUND): ${updated.id} - ${updated.customerName}`,
          debit: 0,
          credit: updated.totalCost,
          account: 'KAS'
        },
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          description: `PEMBATALAN PENDAPATAN JASA: ${updated.id}`,
          debit: updated.serviceFee,
          credit: 0,
          account: 'PENDAPATAN_JASA'
        }
      ];

      if (partsTotal > 0) {
        refundLedger.push({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          description: `PEMBATALAN PENDAPATAN SUKU CADANG: ${updated.id}`,
          debit: partsTotal,
          credit: 0,
          account: 'PENJUALAN'
        });
      }

      setLedger(prev => [...prev, ...refundLedger]);

      // Kembalikan Stok Suku Cadang
      updated.partsUsed.forEach(part => {
        handleStockAdjustment(part.productId, 'IN', part.quantity, `Refund Suku Cadang Service ${updated.id}`);
      });
    }
  };

  const handleNewExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);
    
    const ledgerEntries: LedgerEntry[] = [
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: `Beban: ${expense.description}`,
        debit: expense.amount,
        credit: 0,
        account: 'BEBAN_OPERASIONAL'
      },
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: `Pembayaran Beban: ${expense.description}`,
        debit: 0,
        credit: expense.amount,
        account: 'KAS'
      }
    ];
    setLedger(prev => [...prev, ...ledgerEntries]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    // Hapus dari daftar beban
    setExpenses(prev => prev.filter(e => e.id !== expenseId));

    // Tambahkan jurnal balik di Buku Besar
    const reverseLedger: LedgerEntry[] = [
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: `PEMBATALAN: ${expense.description}`,
        debit: 0,
        credit: expense.amount,
        account: 'BEBAN_OPERASIONAL'
      },
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        description: `PEMBATALAN KAS: ${expense.description}`,
        debit: expense.amount,
        credit: 0,
        account: 'KAS'
      }
    ];
    setLedger(prev => [...prev, ...reverseLedger]);
  };

  const handleStockAdjustment = (productId: string, type: 'IN' | 'OUT' | 'ADJUSTMENT', qty: number, reason: string) => {
    let logQty = qty;
    
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        let newStock = p.stock;
        if (type === 'IN') {
          newStock += qty;
          logQty = qty;
        } else if (type === 'OUT') {
          newStock -= qty;
          logQty = qty;
        } else if (type === 'ADJUSTMENT') {
          logQty = qty - p.stock;
          newStock = qty;
        }
        return { ...p, stock: Math.max(0, newStock) };
      }
      return p;
    }));

    setStockLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      productId,
      timestamp: Date.now(),
      type,
      quantity: Math.abs(logQty),
      reason
    }]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard sales={sales} expenses={expenses} products={products} services={services} />;
      case AppView.POS:
        return <POS products={products} onCompleteSale={handleNewSale} />;
      case AppView.INVENTORY:
        return <Inventory 
                  products={products} 
                  stockLogs={stockLogs} 
                  onAdjust={handleStockAdjustment} 
                  onAddProduct={(p) => setProducts([...products, p])} 
                  onUpdateProduct={handleUpdateProduct}
                  canAdjust={true}
                />;
      case AppView.SERVICE:
        return <ServiceManagement 
                  services={services} 
                  customers={customers}
                  onAddService={(s) => setServices([...services, s])}
                  onUpdateService={handleUpdateService}
                  onAddCustomer={(c) => setCustomers([...customers, c])}
                  onDeleteCustomer={(id) => setCustomers(customers.filter(c => c.id !== id))}
                  products={products}
                  currentUser={currentUser}
                />;
      case AppView.EXPENSES:
        return <Expenses expenses={expenses} onAddExpense={handleNewExpense} onDeleteExpense={handleDeleteExpense} />;
      case AppView.LEDGER:
        return <Finance ledger={ledger} sales={sales} expenses={expenses} />;
      case AppView.AI_INSIGHTS:
        return <AIInsights data={{ sales, expenses, products, stockLogs, services }} />;
      case AppView.USER_MANAGEMENT:
        return <UserManagement 
                  users={users} 
                  onAddUser={(u) => setUsers(prev => [...prev, u])}
                  onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
                  currentUser={currentUser}
                />;
      default:
        return <Dashboard sales={sales} expenses={expenses} products={products} services={services} />;
    }
  };

  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.POS, label: 'Kasir (POS)', icon: ShoppingCart },
    { id: AppView.SERVICE, label: 'Service HP', icon: Smartphone },
    { id: AppView.INVENTORY, label: 'Inventaris & Stok', icon: Package },
    { id: AppView.EXPENSES, label: 'Beban Operasional', icon: Receipt },
    { id: AppView.LEDGER, label: 'Buku Besar & Keuangan', icon: BookText },
    { id: AppView.AI_INSIGHTS, label: 'AI Business Insights', icon: BrainCircuit },
    { id: AppView.USER_MANAGEMENT, label: 'Manajemen Pegawai', icon: Users },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-[width] duration-300 ease-in-out flex flex-col z-20 overflow-hidden`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 whitespace-nowrap overflow-hidden">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-600/30 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <span className={`font-bold text-xl tracking-tight transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            BCR ERP
          </span>
        </div>
        
        <nav className="flex-1 mt-6 px-3 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all whitespace-nowrap group ${
                currentView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              <span className={`font-medium text-sm transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 w-0 pointer-events-none'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 whitespace-nowrap overflow-hidden">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 p-2 text-slate-400 hover:text-white"
          >
            <div className="shrink-0 transition-transform duration-300">
               {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
            <span className={`text-sm transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 pointer-events-none'}`}>
              Tutup Menu
            </span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col relative transition-all duration-300 ease-in-out">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <span className="capitalize text-xs font-bold uppercase tracking-widest text-slate-400">{currentView.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-800">{currentUser.username}</div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">
                Sistem Terbuka
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              {currentUser.username[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
