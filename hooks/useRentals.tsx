import { useContext } from 'react';
import { RentalsContext } from '../contexts/RentalsContext';

export function useRentals() {
  const context = useContext(RentalsContext);
  
  if (!context) {
    throw new Error('useRentals must be used within RentalsProvider');
  }
  
  return context;
}
