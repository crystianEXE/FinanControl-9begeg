import React, { createContext, useState, ReactNode } from 'react';
import { customerService, Customer } from '../services/customerService';

interface CustomersContextType {
  customers: Customer[];
  loading: boolean;
  
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'totalRentals'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  incrementCustomerRentals: (id: string) => void;
  
  getCustomerById: (id: string) => Customer | undefined;
}

export const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export function CustomersProvider({ children }: { children: ReactNode }) {
  // Dados zerados para uso real
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading] = useState(false);
  
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'totalRentals'>) => {
    const newCustomer = customerService.createCustomer(data);
    setCustomers(prev => [...prev, newCustomer]);
  };
  
  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };
  
  const incrementCustomerRentals = (id: string) => {
    setCustomers(prev =>
      prev.map(c => (c.id === id ? customerService.incrementRentals(c) : c))
    );
  };
  
  const getCustomerById = (id: string) => {
    return customers.find(c => c.id === id);
  };
  
  return (
    <CustomersContext.Provider
      value={{
        customers,
        loading,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        incrementCustomerRentals,
        getCustomerById,
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
}
