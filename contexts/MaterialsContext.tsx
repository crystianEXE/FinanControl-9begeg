import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { materialService, Material, Movement, ChartData, MaterialStatus } from '../services/materialService';

interface MaterialsContextType {
  materials: Material[];
  movements: Movement[];
  chartData: ChartData[];
  loading: boolean;
  
  addMaterial: (data: Omit<Material, 'id' | 'rentedQuantity' | 'status' | 'statusHistory' | 'createdAt'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  updateMaterialStatus: (id: string, newStatus: MaterialStatus, changedBy: string, reason?: string) => void;
  deleteMaterial: (id: string) => void;
  
  processEntry: (materialId: string, quantity: number) => void;
  processExit: (materialId: string, quantity: number, customer?: string) => void;
  processReturn: (materialId: string, quantity: number) => void;
  registerInfo: (materialId: string) => void;
  
  getTotalItems: () => number;
  getTotalRented: () => number;
  getTotalAvailable: () => number;
  getMaterialById: (id: string) => Material | undefined;
  
  refreshChartData: () => void;
}

export const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadInitialData();
  }, []);
  
  useEffect(() => {
    saveData();
  }, [materials, movements]);
  
  const loadInitialData = async () => {
    try {
      const storedMaterials = await AsyncStorage.getItem('@materials');
      const storedMovements = await AsyncStorage.getItem('@movements');
      
      if (storedMaterials) {
        setMaterials(JSON.parse(storedMaterials));
      }
      
      if (storedMovements) {
        setMovements(JSON.parse(storedMovements));
      }
      
      setChartData(materialService.generateChartData(7));
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const saveData = async () => {
    try {
      await AsyncStorage.setItem('@materials', JSON.stringify(materials));
      await AsyncStorage.setItem('@movements', JSON.stringify(movements));
    } catch (error) {
      console.error('Error saving materials:', error);
    }
  };
  
  const addMaterial = (data: Omit<Material, 'id' | 'rentedQuantity' | 'status' | 'statusHistory' | 'createdAt'>) => {
    const newMaterial = materialService.createMaterial(data);
    setMaterials(prev => [...prev, newMaterial]);
  };
  
  const updateMaterialStatus = (id: string, newStatus: MaterialStatus, changedBy: string, reason?: string) => {
    setMaterials(prev =>
      prev.map(m => {
        if (m.id === id) {
          return materialService.addStatusHistory(m, newStatus, changedBy, reason);
        }
        return m;
      })
    );
  };
  
  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => 
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    );
  };
  
  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };
  
  const processEntry = (materialId: string, quantity: number) => {
    setMaterials(prev => 
      prev.map(m => {
        if (m.id === materialId) {
          return materialService.processEntry(m, quantity);
        }
        return m;
      })
    );
    
    const movement = materialService.createMovement(materialId, 'entry', quantity);
    setMovements(prev => [movement, ...prev]);
  };
  
  const processExit = (materialId: string, quantity: number, customer?: string) => {
    setMaterials(prev => 
      prev.map(m => {
        if (m.id === materialId) {
          return materialService.processExit(m, quantity, customer);
        }
        return m;
      })
    );
    
    const movement = materialService.createMovement(materialId, 'exit', quantity, { customer });
    setMovements(prev => [movement, ...prev]);
  };
  
  const processReturn = (materialId: string, quantity: number) => {
    setMaterials(prev => 
      prev.map(m => {
        if (m.id === materialId) {
          return materialService.processReturn(m, quantity);
        }
        return m;
      })
    );
    
    const movement = materialService.createMovement(materialId, 'return', quantity);
    setMovements(prev => [movement, ...prev]);
  };
  
  const registerInfo = (materialId: string) => {
    const movement = materialService.createMovement(materialId, 'info', 0);
    setMovements(prev => [movement, ...prev]);
  };
  
  const getTotalItems = () => {
    return materials.reduce((sum, m) => sum + m.totalQuantity, 0);
  };
  
  const getTotalRented = () => {
    return materials.reduce((sum, m) => sum + m.rentedQuantity, 0);
  };
  
  const getTotalAvailable = () => {
    return materials.reduce((sum, m) => sum + materialService.calculateAvailable(m), 0);
  };
  
  const getMaterialById = (id: string) => {
    return materials.find(m => m.id === id);
  };
  
  const refreshChartData = () => {
    setChartData(materialService.generateChartData(7));
  };
  
  return (
    <MaterialsContext.Provider value={{
      materials,
      movements,
      chartData,
      loading,
      addMaterial,
      updateMaterial,
      updateMaterialStatus,
      deleteMaterial,
      processEntry,
      processExit,
      processReturn,
      registerInfo,
      getTotalItems,
      getTotalRented,
      getTotalAvailable,
      getMaterialById,
      refreshChartData,
    }}>
      {children}
    </MaterialsContext.Provider>
  );
}
