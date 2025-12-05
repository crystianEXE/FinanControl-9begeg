import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { rentalService, RentalNote } from '../services/rentalService';

interface RentalsContextType {
  rentals: RentalNote[];
  loading: boolean;
  
  addRental: (rental: Omit<RentalNote, 'id' | 'noteNumber' | 'createdAt' | 'status'>) => RentalNote;
  updateRentalDeliveryId: (id: string, deliveryId: string) => void;
  updateRentalStatus: (id: string, status: 'active' | 'returned' | 'overdue') => void;
  markAsReturned: (id: string) => void;
  returnRentalByMaterial: (materialId: string, quantity: number) => void;
  returnMaterialFromRental: (rentalId: string, materialId: string, quantity: number, observations?: string) => void;
  
  getRentalById: (id: string) => RentalNote | undefined;
  getRentalsByCustomer: (customerId: string) => RentalNote[];
  getActiveRentals: () => RentalNote[];
  getOverdueRentals: () => RentalNote[];
}

export const RentalsContext = createContext<RentalsContextType | undefined>(undefined);

export function RentalsProvider({ children }: { children: ReactNode }) {
  const [rentals, setRentals] = useState<RentalNote[]>([]);
  const [loading] = useState(false);
  
  // Check for overdue rentals periodically
  useEffect(() => {
    const checkOverdue = () => {
      setRentals(prev => prev.map(rental => rentalService.checkOverdue(rental)));
    };
    
    checkOverdue();
    const interval = setInterval(checkOverdue, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const addRental = (data: Omit<RentalNote, 'id' | 'noteNumber' | 'createdAt' | 'status'>) => {
    const newRental = rentalService.createRentalNote(
      {
        id: data.customerId,
        name: data.customerName,
        document: data.customerDocument,
        phone: data.customerPhone,
        email: data.customerEmail,
      },
      data.materials,
      data.expectedReturnDate,
      data.deliveryAddress,
      data.notes,
      rentals.length,
      data.deliveryId,
      data.deliveryType
    );
    
    setRentals(prev => [...prev, newRental]);
    return newRental;
  };
  
  const updateRentalDeliveryId = (id: string, deliveryId: string) => {
    setRentals(prev =>
      prev.map(r => (r.id === id ? { ...r, deliveryId } : r))
    );
  };
  
  const updateRentalStatus = (id: string, status: 'active' | 'returned' | 'overdue') => {
    setRentals(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );
  };
  
  const markAsReturned = (id: string) => {
    setRentals(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = rentalService.updateReturnDate(r);
        return {
          ...updated,
          returnDate: new Date().toISOString(),
        };
      })
    );
  };
  
  const getRentalById = (id: string) => {
    return rentals.find(r => r.id === id);
  };
  
  const getRentalsByCustomer = (customerId: string) => {
    return rentals.filter(r => r.customerId === customerId);
  };
  
  const getActiveRentals = () => {
    return rentals.filter(r => r.status === 'active');
  };
  
  const getOverdueRentals = () => {
    return rentals.filter(r => r.status === 'overdue');
  };
  
  const returnRentalByMaterial = (materialId: string, quantity: number) => {
    setRentals(prev => {
      return prev.map(rental => {
        if (rental.status === 'returned') return rental;
        
        const materialIndex = rental.materials.findIndex(m => m.id === materialId);
        if (materialIndex === -1) return rental;
        
        const material = rental.materials[materialIndex];
        const remainingQty = material.quantity - quantity;
        
        if (remainingQty <= 0) {
          const updatedMaterials = rental.materials.filter((_, i) => i !== materialIndex);
          
          if (updatedMaterials.length === 0) {
            return rentalService.updateReturnDate(rental);
          }
          
          return {
            ...rental,
            materials: updatedMaterials,
          };
        } else {
          const updatedMaterials = [...rental.materials];
          updatedMaterials[materialIndex] = {
            ...material,
            quantity: remainingQty,
          };
          
          return {
            ...rental,
            materials: updatedMaterials,
          };
        }
      });
    });
  };
  
  const returnMaterialFromRental = (rentalId: string, materialId: string, quantity: number, observations?: string) => {
    setRentals(prev => {
      return prev.map(rental => {
        if (rental.id !== rentalId) return rental;
        
        const materialIndex = rental.materials.findIndex(m => m.id === materialId);
        if (materialIndex === -1) return rental;
        
        const material = rental.materials[materialIndex];
        const remainingQty = material.quantity - quantity;
        
        let updatedMaterials;
        if (remainingQty <= 0) {
          // Remove material completamente
          updatedMaterials = rental.materials.filter((_, i) => i !== materialIndex);
        } else {
          // Atualizar quantidade
          updatedMaterials = [...rental.materials];
          updatedMaterials[materialIndex] = {
            ...material,
            quantity: remainingQty,
          };
        }
        
        // Se não há mais materiais, marcar como devolvido
        if (updatedMaterials.length === 0) {
          return {
            ...rentalService.updateReturnDate(rental),
            materials: updatedMaterials,
            notes: rental.notes 
              ? `${rental.notes}\n\nDevolução completa: ${observations || 'Sem observações'}`
              : `Devolução completa: ${observations || 'Sem observações'}`,
          };
        }
        
        // Ainda há materiais pendentes
        return {
          ...rental,
          materials: updatedMaterials,
          notes: rental.notes 
            ? `${rental.notes}\n\nDevolução parcial (${material.name}): ${observations || 'Sem observações'}`
            : `Devolução parcial (${material.name}): ${observations || 'Sem observações'}`,
        };
      });
    });
  };
  
  return (
    <RentalsContext.Provider
      value={{
        rentals,
        loading,
        addRental,
        updateRentalStatus,
        markAsReturned,
        updateRentalDeliveryId,
        getRentalById,
        getRentalsByCustomer,
        getActiveRentals,
        getOverdueRentals,
        returnRentalByMaterial,
        returnMaterialFromRental,
      }}
    >
      {children}
    </RentalsContext.Provider>
  );
}
