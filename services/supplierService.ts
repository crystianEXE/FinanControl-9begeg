export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  category: string; // Tipo de fornecedor (Som, Iluminação, Mobiliário, etc.)
  notes?: string;
  createdAt: string;
  totalOrders: number;
}

export const supplierService = {
  generateId(): string {
    return `supplier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'totalOrders'>): Supplier {
    return {
      id: this.generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      cnpj: data.cnpj,
      address: data.address,
      category: data.category,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      totalOrders: 0,
    };
  },
  
  formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cnpj;
  },
  
  incrementOrders(supplier: Supplier): Supplier {
    return {
      ...supplier,
      totalOrders: supplier.totalOrders + 1,
    };
  },
  
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Som e Áudio': '#8B5CF6',
      'Iluminação': '#F59E0B',
      'Mobiliário': '#10B981',
      'Decoração': '#EC4899',
      'Estruturas': '#3B82F6',
      'Buffet': '#EF4444',
      'Outros': '#6B7280',
    };
    return colors[category] || colors['Outros'];
  },
};
