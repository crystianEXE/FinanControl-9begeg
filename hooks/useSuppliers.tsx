import { useContext } from 'react';
import { SuppliersContext } from '../contexts/SuppliersContext';

export function useSuppliers() {
  const context = useContext(SuppliersContext);
  
  if (!context) {
    throw new Error('useSuppliers must be used within SuppliersProvider');
  }
  
  return context;
}
