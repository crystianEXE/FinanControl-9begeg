import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    saveData();
  }, [customers]);
  
  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@customers');
      if (stored) {
        setCustomers(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@customers', JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customers:', error);
    }
  };
  
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
