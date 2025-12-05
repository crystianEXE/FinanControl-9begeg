import React, { createContext, useState, ReactNode } from 'react';
import { supplierService, Supplier } from '../services/supplierService';

interface SuppliersContextType {
  suppliers: Supplier[];
  loading: boolean;
  
  addSupplier: (data: Omit<Supplier, 'id' | 'createdAt' | 'totalOrders'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  incrementSupplierOrders: (id: string) => void;
  
  getSupplierById: (id: string) => Supplier | undefined;
}

export const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'SoundPro Equipamentos',
      email: 'vendas@soundpro.com.br',
      phone: '1133334444',
      cnpj: '12345678000190',
      category: 'Som e Áudio',
      address: {
        street: 'Rua da Música',
        number: '500',
        neighborhood: 'Vila Olímpia',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04551-000',
      },
      notes: 'Fornecedor principal de equipamentos de som',
      createdAt: new Date().toISOString(),
      totalOrders: 8,
    },
    {
      id: '2',
      name: 'LightTech Iluminação',
      email: 'contato@lighttech.com.br',
      phone: '1144445555',
      cnpj: '98765432000180',
      category: 'Iluminação',
      createdAt: new Date().toISOString(),
      totalOrders: 6,
    },
  ]);
  const [loading] = useState(false);
  
  const addSupplier = (data: Omit<Supplier, 'id' | 'createdAt' | 'totalOrders'>) => {
    const newSupplier = supplierService.createSupplier(data);
    setSuppliers(prev => [...prev, newSupplier]);
  };
  
  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };
  
  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };
  
  const incrementSupplierOrders = (id: string) => {
    setSuppliers(prev =>
      prev.map(s => (s.id === id ? supplierService.incrementOrders(s) : s))
    );
  };
  
  const getSupplierById = (id: string) => {
    return suppliers.find(s => s.id === id);
  };
  
  return (
    <SuppliersContext.Provider
      value={{
        suppliers,
        loading,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        incrementSupplierOrders,
        getSupplierById,
      }}
    >
      {children}
    </SuppliersContext.Provider>
  );
}
