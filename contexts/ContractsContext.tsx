import React, { createContext, useState, ReactNode } from 'react';
import { contractService, Contract, ContractItem } from '../services/contractService';

interface ContractsContextType {
  contracts: Contract[];
  loading: boolean;
  
  addContract: (data: Omit<Contract, 'id' | 'contractNumber' | 'createdAt' | 'subtotal' | 'totalAmount'>) => Contract;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  updatePayment: (id: string, amount: number) => void;
  updateStatus: (id: string, status: Contract['status']) => void;
  
  getContractById: (id: string) => Contract | undefined;
  getContractsByCustomer: (customerId: string) => Contract[];
  getPendingContracts: () => Contract[];
  getActiveContracts: () => Contract[];
}

export const ContractsContext = createContext<ContractsContextType | undefined>(undefined);

export function ContractsProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading] = useState(false);
  
  const addContract = (data: Omit<Contract, 'id' | 'contractNumber' | 'createdAt' | 'subtotal' | 'totalAmount'>) => {
    const subtotal = contractService.calculateSubtotal(data.items);
    
    const newContract: Contract = {
      ...data,
      id: contractService.generateId(),
      contractNumber: contractService.generateContractNumber(contracts.length),
      subtotal,
      totalAmount: subtotal,
      createdAt: new Date().toISOString(),
    };
    
    setContracts(prev => [...prev, newContract]);
    return newContract;
  };
  
  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        
        const updated = { ...c, ...updates };
        
        if (updates.items) {
          updated.subtotal = contractService.calculateSubtotal(updates.items);
          updated.totalAmount = updated.subtotal;
        }
        
        return updated;
      })
    );
  };
  
  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  };
  
  const updatePayment = (id: string, amount: number) => {
    setContracts(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        
        const newPaidAmount = c.paidAmount + amount;
        let paymentStatus: Contract['paymentStatus'] = 'pending';
        
        if (newPaidAmount >= c.totalAmount) {
          paymentStatus = 'paid';
        } else if (newPaidAmount > 0) {
          paymentStatus = 'partial';
        }
        
        return {
          ...c,
          paidAmount: newPaidAmount,
          paymentStatus,
        };
      })
    );
  };
  
  const updateStatus = (id: string, status: Contract['status']) => {
    setContracts(prev =>
      prev.map(c => (c.id === id ? { ...c, status } : c))
    );
  };
  
  const getContractById = (id: string) => {
    return contracts.find(c => c.id === id);
  };
  
  const getContractsByCustomer = (customerId: string) => {
    return contracts.filter(c => c.customerId === customerId);
  };
  
  const getPendingContracts = () => {
    return contracts.filter(c => c.status === 'pending');
  };
  
  const getActiveContracts = () => {
    return contracts.filter(c => c.status === 'active');
  };
  
  return (
    <ContractsContext.Provider
      value={{
        contracts,
        loading,
        addContract,
        updateContract,
        deleteContract,
        updatePayment,
        updateStatus,
        getContractById,
        getContractsByCustomer,
        getPendingContracts,
        getActiveContracts,
      }}
    >
      {children}
    </ContractsContext.Provider>
  );
}
