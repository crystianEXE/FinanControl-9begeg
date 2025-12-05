export interface Delivery {
  id: string;
  customerId: string;
  customerName: string;
  materialIds: string[];
  type: 'delivery' | 'pickup';
  status: 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';
  scheduledDate: string;
  deliveredDate?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  rentalNoteNumber?: string;
  createdAt: string;
}

export const logisticsService = {
  generateId(): string {
    return `delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  createDelivery(data: Omit<Delivery, 'id' | 'status' | 'createdAt'>): Delivery {
    return {
      id: this.generateId(),
      customerId: data.customerId,
      customerName: data.customerName,
      materialIds: data.materialIds,
      type: data.type,
      status: 'scheduled',
      scheduledDate: data.scheduledDate,
      address: data.address,
      notes: data.notes,
      rentalNoteNumber: data.rentalNoteNumber,
      createdAt: new Date().toISOString(),
    };
  },
  
  updateStatus(delivery: Delivery, status: Delivery['status']): Delivery {
    return {
      ...delivery,
      status,
      deliveredDate: status === 'delivered' ? new Date().toISOString() : delivery.deliveredDate,
    };
  },
  
  getStatusLabel(status: Delivery['status']): string {
    const labels = {
      scheduled: 'Agendada',
      in_transit: 'Em trânsito',
      delivered: 'Entregue',
      cancelled: 'Cancelada',
    };
    return labels[status];
  },
  
  getStatusColor(status: Delivery['status']): string {
    const colors = {
      scheduled: '#3B82F6',
      in_transit: '#F59E0B',
      delivered: '#10B981',
      cancelled: '#EF4444',
    };
    return colors[status];
  },
  
  getTypeLabel(type: Delivery['type']): string {
    return type === 'delivery' ? 'Entrega' : 'Retirada';
  },
  
  getTypeIcon(type: Delivery['type']): string {
    return type === 'delivery' ? 'car' : 'business';
  },
};
