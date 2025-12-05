import React, { createContext, useState, ReactNode } from 'react';
import { logisticsService, Delivery } from '../services/logisticsService';

interface LogisticsContextType {
  deliveries: Delivery[];
  loading: boolean;
  
  addDelivery: (data: Omit<Delivery, 'id' | 'status' | 'createdAt'>) => Delivery;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  updateDeliveryStatus: (id: string, status: Delivery['status']) => void;
  
  getDeliveryById: (id: string) => Delivery | undefined;
  getDeliveriesByCustomer: (customerId: string) => Delivery[];
}

export const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export function LogisticsProvider({ children }: { children: ReactNode }) {
  // Dados zerados para uso real
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading] = useState(false);
  
  const addDelivery = (data: Omit<Delivery, 'id' | 'status' | 'createdAt'>) => {
    const newDelivery = logisticsService.createDelivery(data);
    setDeliveries(prev => [...prev, newDelivery]);
    return newDelivery;
  };
  
  const updateDelivery = (id: string, updates: Partial<Delivery>) => {
    setDeliveries(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updates } : d))
    );
  };
  
  const deleteDelivery = (id: string) => {
    setDeliveries(prev => prev.filter(d => d.id !== id));
  };
  
  const updateDeliveryStatus = (id: string, status: Delivery['status']) => {
    setDeliveries(prev =>
      prev.map(d => (d.id === id ? logisticsService.updateStatus(d, status) : d))
    );
  };
  
  const getDeliveryById = (id: string) => {
    return deliveries.find(d => d.id === id);
  };
  
  const getDeliveriesByCustomer = (customerId: string) => {
    return deliveries.filter(d => d.customerId === customerId);
  };
  
  return (
    <LogisticsContext.Provider
      value={{
        deliveries,
        loading,
        addDelivery,
        updateDelivery,
        deleteDelivery,
        updateDeliveryStatus,
        getDeliveryById,
        getDeliveriesByCustomer,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
}
