export interface RentalNote {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerEmail: string;
  materials: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice?: number;
  }[];
  rentalDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  returnDate?: string;
  deliveryAddress?: string;
  notes?: string;
  status: 'active' | 'returned' | 'overdue';
  deliveryId?: string;
  deliveryType?: 'delivery' | 'pickup';
  createdAt: string;
}

export const rentalService = {
  generateNoteNumber(count: number): string {
    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(6, '0');
    return `LOC-${year}-${paddedCount}`;
  },
  
  generateId(): string {
    return `rental-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  createRentalNote(
    customer: {
      id: string;
      name: string;
      document: string;
      phone: string;
      email: string;
    },
    materials: {
      id: string;
      name: string;
      sku: string;
      quantity: number;
      unitPrice?: number;
    }[],
    expectedReturnDate: string,
    deliveryAddress?: string,
    notes?: string,
    noteCount?: number,
    deliveryId?: string,
    deliveryType?: 'delivery' | 'pickup'
  ): RentalNote {
    return {
      id: this.generateId(),
      noteNumber: this.generateNoteNumber(noteCount || 0),
      customerId: customer.id,
      customerName: customer.name,
      customerDocument: customer.document,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      materials,
      rentalDate: new Date().toISOString(),
      expectedReturnDate,
      deliveryAddress,
      notes,
      status: 'active',
      deliveryId,
      deliveryType,
      createdAt: new Date().toISOString(),
    };
  },
  
  updateReturnDate(rental: RentalNote): RentalNote {
    return {
      ...rental,
      actualReturnDate: new Date().toISOString(),
      status: 'returned',
    };
  },
  
  checkOverdue(rental: RentalNote): RentalNote {
    if (rental.status === 'returned') return rental;
    
    const now = new Date();
    const expected = new Date(rental.expectedReturnDate);
    
    if (now > expected) {
      return { ...rental, status: 'overdue' };
    }
    
    return rental;
  },
  
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: '#10B981',
      returned: '#6B7280',
      overdue: '#EF4444',
    };
    return colors[status] || colors.active;
  },
  
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Ativa',
      returned: 'Devolvida',
      overdue: 'Atrasada',
    };
    return labels[status] || status;
  },
  
  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  formatDateShort(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR');
  },
};
