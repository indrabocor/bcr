
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Smartphone, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  AlertCircle, 
  AlertTriangle,
  X, 
  Printer, 
  ChevronRight,
  User,
  Phone,
  Package,
  UserCircle,
  MessageCircle,
  ChevronDown,
  Calculator,
  Eye,
  Trash2,
  Users,
  Calendar,
  FileDown,
  Share2,
  HardDrive,
  Filter,
  History,
  TrendingUp,
  Award,
  PlusCircle,
  Component,
  Lock,
  Grid3X3,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Undo2,
  CalendarCheck,
  UserPlus,
  Check,
  Delete,
  Ban,
  Activity,
  Zap,
  Cpu,
  Layers,
  ClipboardList
} from 'lucide-react';
import { ServiceRecord, ServiceStatus, Product, SaleItem, User as UserType, Customer } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ServiceManagementProps {
  services: ServiceRecord[];
  customers: Customer[];
  onAddService: (s: ServiceRecord) => void;
  onUpdateService: (s: ServiceRecord) => void;
  onAddCustomer: (c: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  products: Product[];
  currentUser: UserType;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ 
  services, customers, onAddService, onUpdateService, onAddCustomer, onDeleteCustomer, products, currentUser 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'ALL'>('ALL');
  const [viewingService, setViewingService] = useState<ServiceRecord | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [viewType, setViewType] = useState<'GRID' | 'TABLE'>('GRID');
  
  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Confirmation state for cancellation & refund
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [showRefundConfirm, setShowRefundConfirm] = useState<string | null>(null);

  // Calculator State for Modal
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcHistory, setCalcHistory] = useState('');

  // Customer Lookup State
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);

  // States for Adding Parts
  const [partSearch, setPartSearch] = useState('');
  const [showPartPicker, setShowPartPicker] = useState(false);

  const receiptRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    customerId: '', 
    customerName: '', 
    customerPhone: '', 
    deviceModel: '', 
    imei: '', 
    devicePattern: '',
    devicePassword: '',
    problemDescription: '', 
    estimatedCost: 0, 
    serviceFee: 0,
    warrantyDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const getStatusConfig = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.PENDING: return { label: 'Menunggu', icon: Clock, color: 'bg-amber-50 text-amber-900 border-amber-300' };
      case ServiceStatus.IN_PROGRESS: return { label: 'Proses Kerja', icon: Wrench, color: 'bg-blue-50 text-blue-900 border-blue-300' };
      case ServiceStatus.COMPLETED: return { label: 'Selesai', icon: CheckCircle2, color: 'bg-green-50 text-green-900 border-green-300' };
      case ServiceStatus.PICKED_UP: return { label: 'Diambil/Lunas', icon: Package, color: 'bg-slate-50 text-slate-900 border-slate-300' };
      case ServiceStatus.CANCELLED: return { label: 'Dibatalkan', icon: Ban, color: 'bg-red-50 text-red-900 border-red-300' };
      case ServiceStatus.WARRANTY_CLAIM: return { label: 'Klaim Garansi', icon: RefreshCw, color: 'bg-purple-50 text-purple-900 border-purple-300' };
      case ServiceStatus.REFUNDED: return { label: 'Biaya Refund', icon: RotateCcw, color: 'bg-rose-900 text-white border-rose-950' };
      default: return { label: 'Unknown', icon: AlertCircle, color: 'bg-gray-50 text-gray-900 border-gray-300' };
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.technicianName && s.technicianName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [services, searchQuery, statusFilter]);

  const customerHistory = useMemo(() => {
    if (!viewingService) return [];
    return services
      .filter(s => s.customerPhone === viewingService.customerPhone && s.id !== viewingService.id)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [services, viewingService]);

  const availableParts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(partSearch.toLowerCase()) || 
      p.sku.toLowerCase().includes(partSearch.toLowerCase())
    );
  }, [products, partSearch]);

  const filteredCustomerResults = useMemo(() => {
    if (!customerSearch) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const formatDate = (ts: number | undefined) => 
    ts ? new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const selectExistingCustomer = (c: Customer) => {
    setFormData({
      ...formData,
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.phone
    });
    setCustomerSearch('');
    setShowCustomerResults(false);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalCustomerId = formData.customerId;
    const existing = customers.find(c => c.phone === formData.customerPhone);
    
    if (!existing) {
      const newCustomer: Customer = {
        id: `CST-${Date.now()}`,
        name: formData.customerName,
        phone: formData.customerPhone,
        address: '',
        createdAt: Date.now()
      };
      onAddCustomer(newCustomer);
      finalCustomerId = newCustomer.id;
    } else {
      finalCustomerId = existing.id;
    }

    const newService: ServiceRecord = {
      ...formData,
      customerId: finalCustomerId,
      id: `SRV-${Date.now()}`,
      status: ServiceStatus.PENDING,
      technicianName: currentUser.username, 
      partsUsed: [],
      totalCost: formData.serviceFee,
      timestamp: Date.now(),
      warrantyDate: new Date(formData.warrantyDate).getTime(),
    };
    onAddService(newService);
    setShowAddModal(false);
    setFormData({
      customerId: '', customerName: '', customerPhone: '', deviceModel: '', imei: '', devicePattern: '', devicePassword: '', problemDescription: '', estimatedCost: 0, serviceFee: 0,
      warrantyDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setCustomerSearch('');
    setIsCalcOpen(false);
  };

  const updateStatus = (service: ServiceRecord, newStatus: ServiceStatus) => {
    const now = Date.now();
    const isFinished = newStatus === ServiceStatus.COMPLETED || newStatus === ServiceStatus.PICKED_UP;
    
    const updated: ServiceRecord = { 
      ...service, 
      status: newStatus,
      completedDate: isFinished ? (service.completedDate || now) : undefined,
      completedTimestamp: isFinished ? (service.completedTimestamp || now) : undefined,
      pickedUpTimestamp: newStatus === ServiceStatus.PICKED_UP ? (service.pickedUpTimestamp || now) : (newStatus === ServiceStatus.COMPLETED ? service.pickedUpTimestamp : undefined)
    };
    
    onUpdateService(updated);
    setViewingService(updated);
    if (newStatus === ServiceStatus.CANCELLED) {
      setConfirmCancelId(null);
    }
  };

  const handleCancelService = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      updateStatus(service, ServiceStatus.CANCELLED);
    }
  };

  const handleRefundService = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      updateStatus(service, ServiceStatus.REFUNDED);
    }
    setShowRefundConfirm(null);
  };

  const saveNotes = () => {
    if (viewingService) {
      onUpdateService(viewingService);
    }
  };

  const addPartToService = (product: Product) => {
    if (!viewingService) return;
    
    const existingPart = viewingService.partsUsed.find(p => p.productId === product.id);
    let newParts: SaleItem[];

    if (existingPart) {
      newParts = viewingService.partsUsed.map(p => 
        p.productId === product.id 
        ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.price } 
        : p
      );
    } else {
      newParts = [...viewingService.partsUsed, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }];
    }

    const newTotal = viewingService.serviceFee + newParts.reduce((sum, p) => sum + p.total, 0);
    
    const updated = {
      ...viewingService,
      partsUsed: newParts,
      totalCost: newTotal
    };

    onUpdateService(updated);
    setViewingService(updated);
    setShowPartPicker(false);
    setPartSearch('');
  };

  const removePartFromService = (productId: string) => {
    if (!viewingService) return;
    
    const newParts = viewingService.partsUsed.filter(p => p.productId !== productId);
    const newTotal = viewingService.serviceFee + newParts.reduce((sum, p) => sum + p.total, 0);
    
    const updated = {
      ...viewingService,
      partsUsed: newParts,
      totalCost: newTotal
    };

    onUpdateService(updated);
    setViewingService(updated);
  };

  const updateWarrantyDate = (service: ServiceRecord, dateString: string) => {
    const updated = { 
      ...service, 
      warrantyDate: dateString ? new Date(dateString).getTime() : undefined 
    };
    onUpdateService(updated);
    setViewingService(updated);
  };

  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcHistory('');
      return;
    }
    if (val === '=') {
      try {
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

  const handlePrint = () => {
    window.print();
  };

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5'
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Nota-${viewingService?.id}.pdf`);
    } catch (error) {
      console.error('Gagal generate PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const shareToWhatsApp = () => {
    if (!viewingService) return;

    // Sanitize phone number (remove non-digits)
    let phone = viewingService.customerPhone.replace(/\D/g, '');
    
    // Convert '08' to '628'
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    }

    const statusLabel = getStatusConfig(viewingService.status).label;
    
    const text = `*NOTA SERVICE DIGITAL - BCR SERVICE HP*
--------------------------------
Halo Kak *${viewingService.customerName}*,
Berikut rincian service perangkat Anda:

🆔 *No. Nota:* ${viewingService.id}
📱 *Perangkat:* ${viewingService.deviceModel}
🔧 *Keluhan:* ${viewingService.problemDescription}
📊 *Status:* ${statusLabel}
💰 *Total Biaya:* ${formatCurrency(viewingService.totalCost)}

Terima kasih telah mempercayakan service kepada kami!
_Simpan pesan ini sebagai bukti garansi._`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePatternClick = (dot: number) => {
    const current = formData.devicePattern.split(',').filter(d => d !== '');
    if (current.includes(dot.toString())) {
      setFormData({ ...formData, devicePattern: current.filter(d => d !== dot.toString()).join(',') });
    } else {
      setFormData({ ...formData, devicePattern: [...current, dot.toString()].join(',') });
    }
  };

  const renderPatternGrid = (patternStr: string, size: number = 10, interactive: boolean = false) => {
    const activeDots = patternStr.split(',').filter(d => d !== '');
    return (
      <div className="grid grid-cols-3 gap-2 w-fit bg-slate-100 p-3 rounded-xl border border-slate-200">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(dot => (
          <button
            key={dot}
            type="button"
            onClick={() => interactive && handlePatternClick(dot)}
            className={`w-${size} h-${size} rounded-full border-2 transition-all flex items-center justify-center text-[10px] font-black
              ${activeDots.includes(dot.toString()) 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                : 'bg-white border-slate-300 text-slate-300'}
              ${interactive ? 'hover:border-blue-500 cursor-pointer' : 'cursor-default'}
            `}
          >
            {activeDots.indexOf(dot.toString()) !== -1 ? activeDots.indexOf(dot.toString()) + 1 : ''}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hologram Effects CSS */}
      <style>{`
        @keyframes scan {
          0% { top: -100%; }
          100% { top: 200%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.5); }
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        .hologram-grid {
          background-image: linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          animation: grid-move 10s linear infinite;
        }
        .scanline {
          position: absolute;
          width: 100%;
          height: 4px;
          background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.8), transparent);
          animation: scan 3s linear infinite;
          z-index: 5;
        }
        .hologram-card {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
          position: relative;
          overflow: hidden;
        }
        .hologram-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, transparent 48%, rgba(59, 130, 246, 0.1) 50%, transparent 52%);
          background-size: 200% 200%;
          pointer-events: none;
        }
      `}</style>

      {/* Decorative Background */}
      <div className="fixed inset-0 hologram-grid pointer-events-none -z-10 opacity-30"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 no-print">
        <div>
          <h2 className="text-3xl font-black text-slate-950 flex items-center gap-3">
            <Smartphone className="text-blue-600" size={32} />
            Service Management
          </h2>
          <p className="text-slate-600 font-bold uppercase tracking-widest text-[10px] mt-1">Advanced Repair Tracking & CRM</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setViewType(viewType === 'GRID' ? 'TABLE' : 'GRID')}
            className="p-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-600 hover:border-blue-600 transition-all shadow-sm"
          >
            {viewType === 'GRID' ? <TableIcon size={20} /> : <LayoutGrid size={20} />}
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} /> PENDAFTARAN SERVICE
          </button>
        </div>
      </div>

      {/* Hidden Print Nota - OPTIMIZED FOR A5 PRINT */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-10 font-sans text-slate-950" ref={receiptRef}>
        <div className="w-[148mm] h-[210mm] mx-auto space-y-6 flex flex-col">
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black uppercase tracking-tighter">BCR SERVICE HP</h1>
              <div className="text-xs font-bold text-slate-600 uppercase">
                <p>Jl. Bisnis Terpadu No. 88, Jakarta</p>
                <p>Telp/WA: 0812-3456-7890</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black"># {viewingService?.id.split('-')[1]}</p>
              <p className="text-xs font-bold uppercase text-slate-500">Nota Service Digital</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-10 py-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Informasi Pelanggan</span>
                <p className="font-black text-lg uppercase">{viewingService?.customerName}</p>
                <p className="font-bold text-sm">{viewingService?.customerPhone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Unit Perangkat</span>
                <p className="font-black text-sm uppercase">{viewingService?.deviceModel}</p>
                <p className="font-bold text-xs">IMEI/SN: {viewingService?.imei || '-'}</p>
              </div>
            </div>
            <div className="space-y-4 flex flex-col items-end">
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Masuk</span>
                <p className="font-black text-sm">{formatDate(viewingService?.timestamp)}</p>
              </div>
              
              {viewingService?.completedDate && (
                <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tanggal Selesai</span>
                    <p className="font-black text-sm">{formatDate(viewingService?.completedDate)}</p>
                </div>
              )}

              <div className="flex gap-4">
                {viewingService?.devicePattern && (
                  <div className="text-right space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pola Kunci</span>
                    {renderPatternGrid(viewingService.devicePattern, 6)}
                  </div>
                )}
                {viewingService?.devicePassword && (
                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Password</span>
                    <p className="font-mono font-black border-2 border-slate-900 px-3 py-1 rounded bg-slate-50">{viewingService.devicePassword}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 border-y-2 border-slate-200 py-6">
            <div className="font-black text-xs uppercase text-slate-400 mb-4 flex justify-between border-b border-slate-100 pb-2">
              <span>Rincian Item & Jasa</span>
              <span>Subtotal</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-black text-sm italic uppercase">Jasa: {viewingService?.problemDescription}</p>
                </div>
                <p className="font-black text-sm">{formatCurrency(viewingService?.serviceFee || 0)}</p>
              </div>
              {viewingService?.partsUsed.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <p className="font-bold text-sm">Suku Cadang: {p.name} (x{p.quantity})</p>
                  <p className="font-black text-sm">{formatCurrency(p.total)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="py-6 flex justify-between items-center">
             <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Petugas / Teknisi</span>
                <p className="font-black text-sm uppercase underline">{viewingService?.technicianName}</p>
             </div>
             <div className="text-right bg-slate-950 text-white px-8 py-4 rounded-3xl">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">Total Biaya</span>
                <p className="text-3xl font-black">{formatCurrency(viewingService?.totalCost || 0)}</p>
             </div>
          </div>

          <div className="bg-red-50 border-2 border-red-200 p-6 rounded-[2rem] space-y-2 mt-auto">
            <p className="text-red-600 font-black text-sm uppercase underline decoration-2 underline-offset-4 tracking-widest">PENTING: Syarat & Ketentuan Garansi</p>
            <div className="text-red-600 text-[10px] font-bold leading-relaxed space-y-1">
              <p>1. Masa berlaku garansi s/d: {formatDate(viewingService?.warrantyDate)}</p>
              <p>2. Membawa nota ini saat klaim garansi atau pengambilan unit.</p>
              <p>3. Tidak bertanggung jawab atas data yang hilang.</p>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-dashed border-slate-300">
             <p className="font-black text-[10px] uppercase tracking-[0.3em]">Terima Kasih Atas Kepercayaan Anda</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-200 shadow-sm space-y-4 no-print relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Cari Nama, Model, No. Nota, atau Teknisi..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all text-base font-black text-slate-950 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
             {(['ALL', ...Object.values(ServiceStatus)] as const).map(status => {
               const config = status === 'ALL' ? null : getStatusConfig(status as ServiceStatus);
               return (
                 <button
                   key={status}
                   onClick={() => setStatusFilter(status)}
                   className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all whitespace-nowrap
                     ${statusFilter === status 
                       ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                       : 'bg-white border-slate-200 text-slate-500 hover:border-blue-600'}
                   `}
                 >
                   {status === 'ALL' ? 'SEMUA' : config?.label}
                 </button>
               );
             })}
          </div>
        </div>
      </div>

      {/* Service List */}
      <div className="relative z-10 no-print">
        {viewType === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map(service => {
              const statusCfg = getStatusConfig(service.status);
              return (
                <div 
                  key={service.id} 
                  onClick={() => setViewingService(service)}
                  className="bg-white rounded-[2.5rem] border-2 border-slate-200 p-6 hover:border-blue-500 transition-all group cursor-pointer shadow-sm hover:shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full border ${statusCfg.color} text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5`}>
                      <statusCfg.icon size={12} />
                      {statusCfg.label}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 font-mono">#{service.id.split('-')[1]}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-1">{service.deviceModel}</h4>
                  <p className="text-sm font-bold text-slate-500 mb-4">{service.customerName}</p>
                  <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Keluhan</p>
                      <p className="text-xs font-bold text-slate-700 line-clamp-1">{service.problemDescription}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase">Estimasi</p>
                       <p className="text-lg font-black text-blue-700">{formatCurrency(service.totalCost)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border-2 border-slate-200 overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b-2 border-slate-100">
                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Perangkat</th>
                      <th className="px-6 py-4">Pelanggan</th>
                      <th className="px-6 py-4">Teknisi</th>
                      <th className="px-6 py-4 text-right">Biaya</th>
                      <th className="px-6 py-4"></th>
                   </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-50">
                   {filteredServices.map(service => {
                     const statusCfg = getStatusConfig(service.status);
                     return (
                        <tr key={service.id} onClick={() => setViewingService(service)} className="hover:bg-blue-50 transition-colors cursor-pointer group">
                           <td className="px-6 py-4">
                              <div className={`inline-flex px-3 py-1 rounded-full border ${statusCfg.color} text-[9px] font-black uppercase tracking-widest items-center gap-1.5`}>
                                <statusCfg.icon size={12} />
                                {statusCfg.label}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <p className="font-black text-slate-900 text-sm">{service.deviceModel}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{service.id}</p>
                           </td>
                           <td className="px-6 py-4">
                              <p className="font-black text-slate-900 text-sm">{service.customerName}</p>
                              <p className="text-[10px] font-bold text-slate-400">{service.customerPhone}</p>
                           </td>
                           <td className="px-6 py-4 font-bold text-slate-600 text-sm">{service.technicianName}</td>
                           <td className="px-6 py-4 text-right font-black text-blue-700">{formatCurrency(service.totalCost)}</td>
                           <td className="px-6 py-4 text-right">
                              <ChevronRight className="inline-block text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
                           </td>
                        </tr>
                     )
                   })}
                </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
             <div className="bg-blue-600 p-8 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                   <Smartphone size={32} />
                   <h3 className="text-2xl font-black uppercase tracking-tight">Pendaftaran Unit Service</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleAddService} className="p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Pelanggan */}
                   <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                         <User size={18} className="text-blue-600" /> Data Pelanggan
                      </h4>
                      <div className="relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Cari / Nama Pelanggan</label>
                        <input 
                          type="text" 
                          className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black"
                          required
                          value={formData.customerName}
                          onChange={e => {
                            setFormData({...formData, customerName: e.target.value});
                            setCustomerSearch(e.target.value);
                            setShowCustomerResults(true);
                          }}
                        />
                        {showCustomerResults && filteredCustomerResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border-2 border-slate-200 rounded-xl mt-1 z-10 shadow-xl overflow-hidden">
                             {filteredCustomerResults.map(c => (
                               <button key={c.id} type="button" onClick={() => selectExistingCustomer(c)} className="w-full p-3 text-left hover:bg-blue-50 flex justify-between items-center border-b last:border-0">
                                  <div>
                                     <p className="font-black text-sm">{c.name}</p>
                                     <p className="text-[10px] font-bold text-slate-400">{c.phone}</p>
                                  </div>
                                  <ChevronRight size={16} />
                               </button>
                             ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nomor WhatsApp</label>
                        <input type="text" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black" required value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} />
                      </div>
                   </div>

                   {/* Perangkat */}
                   <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b-2 border-slate-100 pb-2 flex items-center gap-2">
                         <Smartphone size={18} className="text-blue-600" /> Detail Perangkat
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Model HP</label>
                            <input type="text" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black" required placeholder="Contoh: iPhone 13 Pro" value={formData.deviceModel} onChange={e => setFormData({...formData, deviceModel: e.target.value})} />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">IMEI / SN (Opsional)</label>
                            <input type="text" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black" value={formData.imei} onChange={e => setFormData({...formData, imei: e.target.value})} />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Pola Kunci</label>
                            {renderPatternGrid(formData.devicePattern, 8, true)}
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Password / PIN</label>
                            <input type="text" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black font-mono" value={formData.devicePassword} onChange={e => setFormData({...formData, devicePassword: e.target.value})} />
                         </div>
                      </div>
                   </div>

                   {/* Masalah & Biaya */}
                   <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Deskripsi Masalah / Keluhan</label>
                         <textarea className="w-full border-2 border-slate-200 p-4 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black h-32" required placeholder="Jelaskan masalah secara detail..." value={formData.problemDescription} onChange={e => setFormData({...formData, problemDescription: e.target.value})} />
                      </div>
                      <div className="space-y-4">
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Jasa Service (IDR)</label>
                            <input type="number" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black text-blue-700" required value={formData.serviceFee} onChange={e => setFormData({...formData, serviceFee: Number(e.target.value)})} />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Masa Garansi</label>
                            <input type="date" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black" required value={formData.warrantyDate} onChange={e => setFormData({...formData, warrantyDate: e.target.value})} />
                         </div>
                      </div>
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                   <button 
                      type="button" 
                      onClick={() => {
                        setShowAddModal(false);
                        setFormData({
                          customerId: '', customerName: '', customerPhone: '', deviceModel: '', imei: '', devicePattern: '', devicePassword: '', problemDescription: '', estimatedCost: 0, serviceFee: 0,
                          warrantyDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        });
                        setCustomerSearch('');
                      }}
                      className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
                   >
                      Batal
                   </button>
                   <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all">Simpan Pendaftaran Service</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Viewing / Detail Modal */}
      {viewingService && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 no-print">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-2xl ${getStatusConfig(viewingService.status).color.split(' ')[0]} ${getStatusConfig(viewingService.status).color.split(' ')[1]}`}>
                      <Smartphone size={32} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{viewingService.deviceModel}</h3>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-black text-slate-400 font-mono uppercase tracking-widest">Nota: {viewingService.id}</span>
                         <span className="text-slate-200">|</span>
                         <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Teknisi: {viewingService.technicianName}</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={shareToWhatsApp} className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all border border-green-200" title="Bagikan ke WhatsApp"><MessageCircle size={20} /></button>
                   <button onClick={handlePrint} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"><Printer size={20} /></button>
                   <button onClick={() => setViewingService(null)} className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"><X size={20} /></button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                      {/* Status Timeline / Quick Actions */}
                      <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Update Status Perangkat</h4>
                         <div className="flex flex-wrap gap-2">
                            {viewingService.status !== ServiceStatus.CANCELLED && viewingService.status !== ServiceStatus.PICKED_UP && viewingService.status !== ServiceStatus.REFUNDED && (
                              <>
                                {viewingService.status === ServiceStatus.PENDING && (
                                  <button onClick={() => updateStatus(viewingService, ServiceStatus.IN_PROGRESS)} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Mulai Kerjakan</button>
                                )}
                                {viewingService.status === ServiceStatus.IN_PROGRESS && (
                                  <button onClick={() => updateStatus(viewingService, ServiceStatus.COMPLETED)} className="px-5 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all">Selesaikan Service</button>
                                )}
                                {viewingService.status === ServiceStatus.COMPLETED && (
                                  <button onClick={() => updateStatus(viewingService, ServiceStatus.PICKED_UP)} className="px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 active:scale-95 transition-all">Unit Diambil & Lunas</button>
                                )}
                                <button onClick={() => setConfirmCancelId(viewingService.id)} className="px-5 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all">Batalkan</button>
                              </>
                            )}
                            
                            {(viewingService.status === ServiceStatus.PICKED_UP || viewingService.status === ServiceStatus.WARRANTY_CLAIM) && (
                               <>
                                <button onClick={() => updateStatus(viewingService, ServiceStatus.WARRANTY_CLAIM)} className="px-5 py-3 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-2">
                                   <RefreshCw size={14} /> Terima Klaim Garansi
                                </button>
                                <button onClick={() => setShowRefundConfirm(viewingService.id)} className="px-5 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2">
                                   <RotateCcw size={14} /> Kembalikan Dana (Refund)
                                </button>
                               </>
                            )}

                            {viewingService.status === ServiceStatus.WARRANTY_CLAIM && (
                               <button onClick={() => updateStatus(viewingService, ServiceStatus.COMPLETED)} className="px-5 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-600/20 active:scale-95 transition-all">Service Klaim Selesai</button>
                            )}
                         </div>
                      </div>

                      {/* Keluhan & Parts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rincian Kerusakan</h4>
                            <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
                               <p className="font-black text-slate-800 leading-relaxed italic">"{viewingService.problemDescription}"</p>
                               <div className="mt-6 pt-6 border-t border-slate-100 flex gap-4">
                                  {viewingService.devicePattern && (
                                     <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Pola Unit</p>
                                        {renderPatternGrid(viewingService.devicePattern, 6)}
                                     </div>
                                  )}
                                  {viewingService.devicePassword && (
                                     <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Password</p>
                                        <p className="font-mono font-black border-2 border-slate-200 px-3 py-1.5 rounded-xl bg-slate-50 text-sm">{viewingService.devicePassword}</p>
                                     </div>
                                  )}
                               </div>
                            </div>
                            
                            {/* Catatan Teknisi Section */}
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Catatan Teknisi & Diagnosa</h4>
                                    <button
                                        onClick={saveNotes}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={12} /> Simpan Catatan
                                    </button>
                                </div>
                                <textarea
                                    className="w-full h-32 p-4 bg-yellow-50/50 border-2 border-yellow-100 rounded-2xl focus:border-yellow-400 focus:bg-yellow-50 outline-none font-medium text-slate-700 text-sm resize-none leading-relaxed"
                                    placeholder="Tulis hasil diagnosa, langkah perbaikan, atau catatan internal teknisi di sini..."
                                    value={viewingService.notes || ''}
                                    onChange={(e) => setViewingService({ ...viewingService, notes: e.target.value })}
                                ></textarea>
                                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase text-right">Catatan ini bersifat internal dan tidak tercetak di nota pelanggan.</p>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="flex justify-between items-center">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Suku Cadang / Parts</h4>
                               {viewingService.status !== ServiceStatus.PICKED_UP && viewingService.status !== ServiceStatus.CANCELLED && viewingService.status !== ServiceStatus.REFUNDED && (
                                 <button onClick={() => setShowPartPicker(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Tambah Part</button>
                               )}
                            </div>
                            <div className="space-y-3">
                               {viewingService.partsUsed.length > 0 ? viewingService.partsUsed.map(part => (
                                 <div key={part.productId} className="flex justify-between items-center p-4 bg-white border-2 border-slate-100 rounded-2xl group transition-all hover:border-blue-200">
                                    <div>
                                       <p className="font-black text-slate-900 text-xs">{part.name}</p>
                                       <p className="text-[9px] font-bold text-slate-400">Qty: {part.quantity} × {formatCurrency(part.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="font-black text-blue-700 text-xs">{formatCurrency(part.total)}</span>
                                       {viewingService.status !== ServiceStatus.PICKED_UP && viewingService.status !== ServiceStatus.CANCELLED && viewingService.status !== ServiceStatus.REFUNDED && (
                                          <button onClick={() => removePartFromService(part.productId)} className="text-red-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                       )}
                                    </div>
                                 </div>
                               )) : (
                                 <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300">
                                    <Package size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Belum Ada Suku Cadang</p>
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Sidebar Info */}
                   <div className="space-y-8">
                      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/20">
                         <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6">Informasi Pembayaran</h4>
                         <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                               <span>Biaya Jasa</span>
                               <span className="text-white">{formatCurrency(viewingService.serviceFee)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                               <span>Total Suku Cadang</span>
                               <span className="text-white">{formatCurrency(viewingService.partsUsed.reduce((sum, p) => sum + p.total, 0))}</span>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-end">
                               <span className="text-sm font-black uppercase">Total Biaya</span>
                               <span className="text-3xl font-black text-blue-400">{formatCurrency(viewingService.totalCost)}</span>
                            </div>
                         </div>
                         <div className="mt-8 space-y-3">
                            <button onClick={handlePrint} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                                <Printer size={18} /> Cetak Nota Fisik
                            </button>
                            <button onClick={shareToWhatsApp} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-700 transition-all"><MessageCircle size={18} /> Kirim Ke WhatsApp</button>
                            <button onClick={downloadPDF} disabled={isGeneratingPdf} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
                               {isGeneratingPdf ? <RefreshCw size={18} className="animate-spin" /> : <FileDown size={18} />} Simpan PDF
                            </button>
                         </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
                         <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tanggal Selesai (Completed)</h4>
                            <input 
                              type="date" 
                              readOnly
                              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-100 text-slate-600 outline-none font-black text-xs cursor-not-allowed opacity-75" 
                              value={viewingService.completedDate ? new Date(viewingService.completedDate).toISOString().split('T')[0] : ''}
                            />
                            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Terisi otomatis saat status Selesai / Diambil.</p>
                         </div>
                         <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Masa Garansi</h4>
                            <input 
                              type="date" 
                              className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 focus:border-blue-600 outline-none font-black text-xs" 
                              value={new Date(viewingService.warrantyDate || 0).toISOString().split('T')[0]}
                              onChange={(e) => updateWarrantyDate(viewingService, e.target.value)}
                            />
                            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">Gunakan nota asli untuk klaim garansi.</p>
                         </div>
                         
                         <div className="pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Informasi Pelanggan</h4>
                               {customerHistory.length > 0 && (
                                 <button 
                                   onClick={() => setShowHistoryModal(true)}
                                   className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"
                                 >
                                    <History size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Riwayat ({customerHistory.length})</span>
                                 </button>
                               )}
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                               <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-100">
                                  <User size={20} />
                               </div>
                               <div>
                                  <p className="font-black text-slate-900 uppercase text-sm leading-tight">{viewingService.customerName}</p>
                                  <p className="text-xs font-bold text-slate-500 mt-0.5">{viewingService.customerPhone}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Part Picker Modal */}
      {showPartPicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-sm font-black uppercase tracking-widest">Pilih Suku Cadang</h4>
              <button onClick={() => setShowPartPicker(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Cari Part..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 outline-none font-bold" value={partSearch} onChange={e => setPartSearch(e.target.value)} />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {availableParts.map(p => (
                  <button key={p.id} onClick={() => addPartToService(p)} className="w-full p-4 bg-slate-50 rounded-xl hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all flex justify-between items-center">
                    <div className="text-left">
                      <p className="font-black text-sm">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">SKU: {p.sku} | Stok: {p.stock}</p>
                    </div>
                    <span className="font-black text-blue-700 text-sm">{formatCurrency(p.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      {confirmCancelId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2 uppercase">Batalkan Service?</h4>
            <p className="text-slate-500 text-sm mb-8 font-bold">Tindakan ini tidak dapat dibatalkan. Status akan berubah menjadi DIBATALKAN.</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmCancelId(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Kembali</button>
              <button onClick={() => handleCancelService(confirmCancelId)} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-600/20">Ya, Batalkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 text-center animate-in zoom-in duration-300 border border-rose-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2 uppercase">Konfirmasi Pengembalian Dana</h4>
            <div className="text-slate-500 text-sm mb-8 font-bold space-y-2">
              <p>Anda akan melakukan refund untuk service ini.</p>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-rose-700 text-xs">
                <p>⚠️ Peringatan: Saldo kas akan dipotong otomatis dan stok sparepart yang digunakan akan dikembalikan ke inventaris.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowRefundConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Batal</button>
              <button onClick={() => handleRefundService(showRefundConfirm)} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-600/20">Proses Refund</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer History Modal */}
      {showHistoryModal && viewingService && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50">
               <div>
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <History size={20} className="text-blue-600" /> Riwayat Service
                  </h4>
                  <p className="text-xs font-bold text-slate-500 mt-1">{viewingService.customerName} • {viewingService.customerPhone}</p>
               </div>
               <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-500"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {customerHistory.map(h => {
                   const statusInfo = getStatusConfig(h.status);
                   return (
                    <div 
                      key={h.id} 
                      onClick={() => {
                        setViewingService(h);
                        setShowHistoryModal(false);
                      }}
                      className="p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group bg-white"
                    >
                        <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase font-mono">
                                  {formatDate(h.timestamp)}
                                </span>
                                <div className={`px-2 py-1 rounded-md border flex items-center gap-1 ${statusInfo.color}`}>
                                    <statusInfo.icon size={10} />
                                    <span className="text-[9px] font-black uppercase">{statusInfo.label}</span>
                                </div>
                             </div>
                             <span className="text-slate-900 font-black text-sm">{formatCurrency(h.totalCost)}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <h5 className="font-black text-slate-900 text-sm">{h.deviceModel}</h5>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{h.problemDescription}"</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                   );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
