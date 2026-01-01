
import { Product } from './types';

const now = Date.now();

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Kopi Susu Gula Aren', 
    sku: 'CF-001', 
    price: 25000, 
    cost: 12000, 
    stock: 50, 
    category: 'Beverage',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400',
    createdAt: now,
    updatedAt: now
  },
  { 
    id: '2', 
    name: 'Roti Bakar Coklat', 
    sku: 'FD-001', 
    price: 18000, 
    cost: 8000, 
    stock: 30, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=400',
    createdAt: now,
    updatedAt: now
  },
  { 
    id: '3', 
    name: 'Matcha Latte', 
    sku: 'CF-002', 
    price: 28000, 
    cost: 15000, 
    stock: 20, 
    category: 'Beverage',
    image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=400',
    createdAt: now,
    updatedAt: now
  },
  { 
    id: '4', 
    name: 'Kentang Goreng', 
    sku: 'FD-002', 
    price: 15000, 
    cost: 6000, 
    stock: 40, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=400',
    createdAt: now,
    updatedAt: now
  },
];

export const TAX_RATE = 0.11; // 11% PPN Indonesia