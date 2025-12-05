import { useContext } from 'react';
import { MaterialsContext } from '../contexts/MaterialsContext';

export function useMaterials() {
  const context = useContext(MaterialsContext);
  
  if (!context) {
    throw new Error('useMaterials must be used within MaterialsProvider');
  }
  
  return context;
}
