
import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Package, 
  Calculator, 
  X,
  Delete,
  ChevronRight,
  Printer,
  CheckCircle2,
  FileText,
  Calendar,
  Clock,
  CreditCard as PaymentIcon,
  PartyPopper,
  ReceiptText
} from 'lucide-react';
import { Product, Sale, SaleItem } from '../types';
import { TAX_RATE } from '../constants';

interface POSProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
}

const POS: React.FC<POSProps> = ({ products, onCompleteSale }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'DEBIT' | 'CREDIT'>('CASH');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Calculator State
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Stok habis!");
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Batas stok tercapai!");
          return prev;
        }
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        const prod = products.find(p => p.id === productId);
        if (prod && newQty > prod.stock) {
          alert("Stok terbatas!");
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const sale: Sale = {
      id: `TRX-${Date.now()}`,
      timestamp: Date.now(),
      items: cart,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      paymentMethod
    };

    onCompleteSale(sale);
    setLastSale(sale);
    setCart([]);
    setShowReceiptModal(true);
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handlePrint = () => {
    window.print();
  };

  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcHistory('');
      return;
    }
    if (val === '=') {
      try {
        // Simple eval safely for basic ops
        const sanitized = calcDisplay.replace('x', '*').replace('÷', '/');
        const result = Function('"use strict";return (' + sanitized + ')')();
        setCalcHistory(calcDisplay + ' =');
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay('Error');
      }
      return;
    }
    if (val === 'del') {
      setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }

    setCalcDisplay(prev => {
      if (prev === '0' && !isNaN(Number(val))) return val;
      return prev + val;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Hidden Thermal Receipt Layout */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-4 font-mono text-[10px] leading-tight text-slate-950">
        <div className="max-w-[300px] mx-auto text-center space-y-3">
          <div className="border-b-2 border-slate-900 pb-2">
            <h1 className="text-sm font-black uppercase">BCR STORE</h1>
            <p className="font-bold">Jl. Bisnis Terpadu No. 88, Jakarta</p>
            <p className="font-bold">Telp: 0812-3456-7890</p>
          </div>
          <div className="text-left py-2 space-y-1">
            <div className="flex justify-between font-bold"><span>ID:</span><span>{lastSale?.id}</span></div>
            <div className="flex justify-between font-bold"><span>Tgl:</span><span>{lastSale ? new Date(lastSale.timestamp).toLocaleString('id-ID') : '-'}</span></div>
            <div className="flex justify-between font-bold"><span>Metode:</span><span>{lastSale?.paymentMethod}</span></div>
          </div>
          <div className="border-y border-dashed py-2 text-left">
            <div className="font-black border-b border-dashed mb-1 pb-1 flex justify-between uppercase">
              <span>Produk</span>
              <span>Total</span>
            </div>
            {lastSale?.items.map((item, idx) => (
              <div key={idx} className="flex justify-between mb-1 font-bold">
                <span className="flex-1">{item.name} (x{item.quantity})</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="text-right pt-2 space-y-1">
            <div className="flex justify-between font-bold">
              <span>Subtotal:</span>
              <span>{formatCurrency(lastSale?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Pajak (11%):</span>
              <span>{formatCurrency(lastSale?.tax || 0)}</span>
            </div>
            <div className="flex justify-between text-xs font-black uppercase border-t border-dashed pt-1 mt-1">
              <span>Total:</span>
              <span>{formatCurrency(lastSale?.total || 0)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-dashed">
            <p className="font-black uppercase tracking-widest">Terima Kasih</p>
            <p className="text-[8px] italic font-bold">Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>
      </div>

      {/* Main UI */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden no-print">
        <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Cari Produk atau Scan Barcode..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:border-blue-600 outline-none transition-all shadow-sm text-base font-black text-slate-950 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${paymentMethod === 'CASH' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-600'}`}
            >
              <Banknote size={18} /> Tunai
            </button>
            <button 
              onClick={() => setPaymentMethod('DEBIT')}
              className={`p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${paymentMethod === 'DEBIT' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-600'}`}
            >
              <CreditCard size={18} /> Debit
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className={`flex flex-col text-left rounded-3xl border-2 transition-all duration-300 group overflow-hidden relative ${
                  product.stock <= 0 
                  ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed grayscale' 
                  : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-xl'
                }`}
              >
                <div className="aspect-[4/5] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                   {product.image ? (
                     <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                   ) : (
                     <Package size={48} className="text-slate-300" />
                   )}
                   {product.stock <= 0 && (
                     <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">HABIS</span>
                     </div>
                   )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{product.category}</span>
                  <h4 className="font-black text-slate-900 text-sm leading-tight mb-3 line-clamp-2 h-10">{product.name}</h4>
                  <div className="mt-auto flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-500 font-black font-mono uppercase block">SISA: {product.stock}</span>
                      <span className="font-black text-blue-700 text-lg">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-[400px] bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative no-print">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBag size={24} className="text-blue-400" />
            <h3 className="font-black text-lg uppercase tracking-tight">Keranjang</h3>
          </div>
          <button onClick={() => setIsCalcOpen(!isCalcOpen)} className={`p-2 rounded-xl transition-all ${isCalcOpen ? 'bg-white text-slate-900' : 'hover:bg-white/20'}`}>
            <Calculator size={22} />
          </button>
        </div>

        {isCalcOpen && (
          <div className="absolute top-[72px] left-0 right-0 bg-slate-900 text-white z-10 p-5 shadow-2xl border-b border-slate-700 animate-in slide-in-from-top-4">
            <div className="bg-slate-800 p-4 rounded-2xl mb-4 text-right border-2 border-slate-700">
              <div className="text-[10px] text-slate-400 font-black h-4 uppercase">{calcHistory}</div>
              <div className="text-3xl font-black font-mono text-white">{calcDisplay}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['C', '÷', 'x', 'del', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '0', '.', '='].map(b => (
                <button 
                  key={b} 
                  onClick={() => handleCalcBtn(b)} 
                  className={`p-4 rounded-xl font-black text-base transition-all active:scale-95 ${b === '=' ? 'bg-blue-600 text-white col-span-2' : b === 'del' ? 'bg-red-900/40 text-red-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                >
                  {b === 'del' ? <Delete size={20} className="mx-auto" /> : b}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length > 0 ? cart.map(item => (
            <div key={item.productId} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 group transition-all hover:bg-white hover:border-blue-200">
              <div className="flex-1">
                <h4 className="font-black text-slate-950 text-sm line-clamp-1">{item.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-black text-blue-700">{formatCurrency(item.price)}</span>
                  <span className="text-[11px] text-slate-600 font-black">× {item.quantity}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white rounded-xl border-2 border-slate-300 p-1 shadow-sm">
                  <button onClick={() => updateCartQty(item.productId, -1)} className="p-1.5 text-slate-400 hover:text-red-600 transition-all"><Minus size={14} strokeWidth={3} /></button>
                  <span className="text-xs font-black w-7 text-center text-slate-950">{item.quantity}</span>
                  <button onClick={() => updateCartQty(item.productId, 1)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-all"><Plus size={14} strokeWidth={3} /></button>
                </div>
              </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
              <ShoppingBag size={64} className="opacity-10 mb-4" />
              <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Pilih Produk</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t-2 border-slate-200 space-y-5">
          <div className="space-y-2 bg-white p-5 rounded-3xl border-2 border-slate-300 shadow-sm">
            <div className="flex justify-between text-slate-600 font-black text-[10px] uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-slate-950">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-black text-[10px] uppercase tracking-widest">
              <span>Pajak (11%)</span>
              <span className="text-slate-950">{formatCurrency(totals.tax)}</span>
            </div>
            <div className="flex justify-between items-end pt-4 mt-3 border-t-2 border-dashed border-slate-300">
              <span className="font-black text-slate-950 text-base uppercase tracking-tight">Total</span>
              <span className="text-blue-700 text-3xl font-black leading-none">{formatCurrency(totals.total)}</span>
            </div>
          </div>
          <button 
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-black rounded-[2rem] transition-all shadow-xl shadow-blue-600/30 text-lg uppercase tracking-widest active:scale-95"
          >
            Selesaikan Transaksi
          </button>
        </div>
      </div>

      {/* Success Receipt Modal */}
      {showReceiptModal && lastSale && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-green-600 p-10 text-white text-center">
              <div className="bg-white/20 p-4 rounded-full inline-block mb-4">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight">Transaksi Berhasil!</h3>
              <p className="text-green-100 font-bold mt-2">Nomor Invoice: {lastSale.id}</p>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 space-y-4">
                <div className="flex justify-between items-center text-slate-600 font-black text-xs uppercase tracking-widest">
                  <span>Metode Pembayaran</span>
                  <span className="text-slate-950">{lastSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center border-t-2 border-dashed border-slate-200 pt-4">
                  <span className="font-black text-slate-800 uppercase tracking-widest text-sm">Total Dibayar</span>
                  <span className="text-2xl font-black text-blue-700">{formatCurrency(lastSale.total)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handlePrint}
                  className="bg-slate-950 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                >
                  <Printer size={20} /> Cetak Struk Nota
                </button>
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className="bg-white text-slate-950 border-2 border-slate-200 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                >
                  <ShoppingBag size={20} /> Transaksi Baru
                </button>
              </div>
              
              <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest italic">
                Sistem Kasir Terintegrasi BCR ERP
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
