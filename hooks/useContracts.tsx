import { useContext } from 'react';
import { ContractsContext } from '../contexts/ContractsContext';

export function useContracts() {
  const context = useContext(ContractsContext);
  
  if (!context) {
    throw new Error('useContracts must be used within ContractsProvider');
  }
  
  return context;
}
