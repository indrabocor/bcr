
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  POS = 'POS',
  INVENTORY = 'INVENTORY',
  SERVICE = 'SERVICE',
  EXPENSES = 'EXPENSES',
  LEDGER = 'LEDGER',
  AI_INSIGHTS = 'AI_INSIGHTS',
  USER_MANAGEMENT = 'USER_MANAGEMENT'
}

export enum UserRole {
  ADMIN = 'ADMIN', // Akun Utama
  STAFF = 'STAFF'  // Akun Khusus
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PICKED_UP = 'PICKED_UP',
  WARRANTY_CLAIM = 'WARRANTY_CLAIM',
  REFUNDED = 'REFUNDED'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  image?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'CASH' | 'DEBIT' | 'CREDIT';
}

export interface ServiceRecord {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  imei?: string;
  devicePattern?: string; // Pola kunci (urutan titik)
  devicePassword?: string; // Password/PIN
  problemDescription: string;
  technicianName: string;
  status: ServiceStatus;
  estimatedCost: number;
  serviceFee: number;
  partsUsed: SaleItem[];
  totalCost: number;
  timestamp: number;
  completedTimestamp?: number;
  pickedUpTimestamp?: number;
  completedDate?: number;
  warrantyDate?: number;
  notes?: string;
}

export interface Expense {
  id: string;
  timestamp: number;
  description: string;
  amount: number;
  category: 'RENT' | 'UTILITIES' | 'SALARY' | 'SUPPLIES' | 'MARKETING' | 'OTHER';
}

export interface StockLog {
  id: string;
  productId: string;
  timestamp: number;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: number;
  description: string;
  debit: number;
  credit: number;
  account: string; // e.g., 'CASH', 'SALES', 'EXPENSE', 'INVENTORY', 'SERVICE_REVENUE'
}
