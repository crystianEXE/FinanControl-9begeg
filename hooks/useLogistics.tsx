import { useContext } from 'react';
import { LogisticsContext } from '../contexts/LogisticsContext';

export function useLogistics() {
  const context = useContext(LogisticsContext);
  
  if (!context) {
    throw new Error('useLogistics must be used within LogisticsProvider');
  }
  
  return context;
}
