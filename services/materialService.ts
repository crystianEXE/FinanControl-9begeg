export type MaterialStatus = 'available' | 'rented' | 'maintenance' | 'damaged' | 'retired';

export interface StatusHistory {
  id: string;
  status: MaterialStatus;
  previousStatus: MaterialStatus;
  changedBy: string;
  reason?: string;
  timestamp: string;
}

export interface Material {
  id: string;
  sku: string;
  name: string;
  totalQuantity: number;
  rentedQuantity: number;
  location: string;
  status: MaterialStatus;
  observations?: string;
  rentalPrice?: number;
  replacementPrice?: number;
  statusHistory: StatusHistory[];
  createdAt: string;
  imageUri?: string;
}

export interface Movement {
  id: string;
  materialId: string;
  type: 'entry' | 'exit' | 'return' | 'info';
  quantity: number;
  location?: string;
  customer?: string;
  timestamp: string;
}

export interface ChartData {
  date: string;
  value: number;
}

const STORAGE_KEY = '@estoquecontrol_materials';
const MOVEMENTS_KEY = '@estoquecontrol_movements';

export const materialService = {
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  generateSKU(): string {
    const prefix = 'MAT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },
  
  createMaterial(data: Omit<Material, 'id' | 'rentedQuantity' | 'status' | 'statusHistory' | 'createdAt'>): Material {
    const initialStatus: MaterialStatus = 'available';
    return {
      id: this.generateId(),
      sku: data.sku || this.generateSKU(),
      name: data.name,
      totalQuantity: data.totalQuantity,
      rentedQuantity: 0,
      location: data.location || 'Depósito Principal',
      status: initialStatus,
      observations: data.observations,
      rentalPrice: data.rentalPrice || 150,
      replacementPrice: data.replacementPrice || 500,
      statusHistory: [{
        id: this.generateId(),
        status: initialStatus,
        previousStatus: initialStatus,
        changedBy: 'Sistema',
        reason: 'Material cadastrado',
        timestamp: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      imageUri: data.imageUri,
    };
  },
  
  calculateAvailable(material: Material): number {
    if (material.status === 'retired' || material.status === 'damaged') return 0;
    if (material.status === 'maintenance') return 0;
    return Math.max(0, material.totalQuantity - material.rentedQuantity);
  },
  
  addStatusHistory(
    material: Material, 
    newStatus: MaterialStatus, 
    changedBy: string, 
    reason?: string
  ): Material {
    const historyEntry: StatusHistory = {
      id: this.generateId(),
      status: newStatus,
      previousStatus: material.status,
      changedBy,
      reason,
      timestamp: new Date().toISOString(),
    };
    
    return {
      ...material,
      status: newStatus,
      statusHistory: [historyEntry, ...material.statusHistory],
    };
  },
  
  createMovement(
    materialId: string,
    type: Movement['type'],
    quantity: number,
    options?: { location?: string; customer?: string }
  ): Movement {
    return {
      id: this.generateId(),
      materialId,
      type,
      quantity,
      location: options?.location,
      customer: options?.customer,
      timestamp: new Date().toISOString(),
    };
  },
  
  processEntry(material: Material, quantity: number): Material {
    return {
      ...material,
      totalQuantity: material.totalQuantity + quantity,
    };
  },
  
  processExit(material: Material, quantity: number, customer?: string): Material {
    const available = this.calculateAvailable(material);
    if (quantity > available) {
      throw new Error('Quantidade insuficiente disponível');
    }
    
    const newRentedQuantity = material.rentedQuantity + quantity;
    const newAvailable = material.totalQuantity - newRentedQuantity;
    
    // Só muda o status para 'rented' se TODAS as unidades estiverem locadas
    const newStatus = newAvailable === 0 ? 'rented' : material.status;
    
    return {
      ...material,
      rentedQuantity: newRentedQuantity,
      status: newStatus,
    };
  },
  
  processReturn(material: Material, quantity: number): Material {
    const returned = Math.min(quantity, material.rentedQuantity);
    const newRented = material.rentedQuantity - returned;
    
    return {
      ...material,
      rentedQuantity: newRented,
      location: newRented === 0 ? 'Depósito Principal' : material.location,
      status: newRented === 0 ? 'available' : 'rented',
    };
  },
  
  generateChartData(days: number = 7): ChartData[] {
    const data: ChartData[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: Math.floor(Math.random() * 30) + 20,
      });
    }
    
    return data;
  },
  
  getStatusLabel(status: MaterialStatus): string {
    const labels: Record<MaterialStatus, string> = {
      available: 'Disponível',
      rented: 'Locado',
      maintenance: 'Manutenção',
      damaged: 'Danificado',
      retired: 'Baixa',
    };
    return labels[status];
  },
  
  getStatusColor(status: MaterialStatus): string {
    const colors: Record<MaterialStatus, string> = {
      available: '#10B981',
      rented: '#F59E0B',
      maintenance: '#3B82F6',
      damaged: '#EF4444',
      retired: '#6B7280',
    };
    return colors[status];
  },
  
  getStatusIcon(status: MaterialStatus): string {
    const icons: Record<MaterialStatus, string> = {
      available: 'checkmark-circle',
      rented: 'time',
      maintenance: 'construct',
      damaged: 'warning',
      retired: 'close-circle',
    };
    return icons[status];
  },
};
