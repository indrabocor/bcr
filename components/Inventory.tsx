
import React, { useState, useMemo } from 'react';
import { 
  Package, 
  PlusCircle, 
  AlertCircle,
  ClipboardCheck,
  Search,
  List,
  Activity,
  Filter,
  Image as ImageIcon,
  X,
  Edit2,
  Info,
  AlertTriangle,
  ArrowRight,
  Link as LinkIcon,
  Calendar,
  RefreshCcw
} from 'lucide-react';
import { Product, StockLog } from '../types';

interface InventoryProps {
  products: Product[];
  stockLogs: StockLog[];
  onAdjust: (id: string, type: 'IN' | 'OUT' | 'ADJUSTMENT', qty: number, reason: string) => void;
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  canAdjust: boolean;
}

type TabType = 'PRODUCT_LIST' | 'ALL_LOGS' | 'OPNAME_HISTORY';

const Inventory: React.FC<InventoryProps> = ({ products, stockLogs, onAdjust, onAddProduct, onUpdateProduct, canAdjust }) => {
  const [activeTab, setActiveTab] = useState<TabType>('PRODUCT_LIST');
  const [showAdjustModal, setShowAdjustModal] = useState<string | null>(null);
  const [adjType, setAdjType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('ADJUSTMENT');
  const [adjQty, setAdjQty] = useState<number>(0);
  const [adjReason, setAdjReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Kategori');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({ 
    name: '', sku: '', price: 0, cost: 0, stock: 0, category: 'General', image: '' 
  });

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Semua Kategori', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const startTime = new Date(dateRange.start).setHours(0, 0, 0, 0);
    const endTime = new Date(dateRange.end).setHours(23, 59, 59, 999);

    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua Kategori' || p.category === selectedCategory;
      const pAddedAt = p.createdAt || 0;
      const pUpdatedAt = p.updatedAt || 0;
      const matchesDate = (pAddedAt >= startTime && pAddedAt <= endTime) || (pUpdatedAt >= startTime && pUpdatedAt <= endTime);
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [products, searchQuery, selectedCategory, dateRange]);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (editingProduct) {
      onUpdateProduct({ ...productFormData, id: editingProduct.id, updatedAt: now, createdAt: editingProduct.createdAt || now } as Product);
    } else {
      onAddProduct({ ...productFormData, id: crypto.randomUUID(), createdAt: now, updatedAt: now } as Product);
    }
    setShowProductModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-950 flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            Inventaris & Stok
          </h2>
          <p className="text-slate-600 font-bold">Pantau aset barang dan lakukan opname berkala dengan data yang jelas.</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setProductFormData({ name: '', sku: '', price: 0, cost: 0, stock: 0, category: 'General', image: '' }); setShowProductModal(true); }} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95">
          TAMBAH PRODUK BARU
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Cari Nama Produk atau SKU..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all text-base font-black text-slate-950 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="w-full lg:w-auto p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 focus:border-blue-600 outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-black tracking-widest border-b-2 border-slate-100">
              <tr>
                <th className="px-8 py-6">Produk & SKU</th>
                <th className="px-6 py-6">Kategori</th>
                <th className="px-6 py-6">Harga Jual</th>
                <th className="px-6 py-6 text-center">Stok</th>
                <th className="px-8 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0">
                        {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-slate-300" />}
                      </div>
                      <div>
                        <div className="font-black text-slate-950 text-sm leading-tight">{p.name}</div>
                        <div className="text-[10px] font-black text-slate-500 font-mono uppercase tracking-widest mt-0.5">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-[10px] font-black uppercase border border-slate-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-blue-700">{formatCurrency(p.price)}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-lg font-black ${p.stock < 10 ? 'text-red-600' : 'text-slate-950'}`}>{p.stock}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => { setEditingProduct(p); setProductFormData({ ...p }); setShowProductModal(true); }} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tight">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button onClick={() => setShowProductModal(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Nama Lengkap Produk</label>
                  <input type="text" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-blue-600 focus:bg-white outline-none font-black text-slate-950 placeholder:text-slate-400" required value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">SKU / Kode Barang</label>
                  <input type="text" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-blue-600 focus:bg-white outline-none font-black text-slate-950 font-mono uppercase" required value={productFormData.sku} onChange={e => setProductFormData({...productFormData, sku: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Kategori</label>
                  <input type="text" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-blue-600 focus:bg-white outline-none font-black text-slate-950" required value={productFormData.category} onChange={e => setProductFormData({...productFormData, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Harga Modal (IDR)</label>
                  <input type="number" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-blue-600 focus:bg-white outline-none font-black text-slate-950" required value={productFormData.cost} onChange={e => setProductFormData({...productFormData, cost: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Harga Jual (IDR)</label>
                  <input type="number" className="w-full border-2 border-slate-200 p-4 rounded-2xl bg-slate-50 focus:border-blue-600 focus:bg-white outline-none font-black text-blue-700" required value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95">Simpan Data Produk</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
