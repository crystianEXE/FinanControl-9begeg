export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  documentType: 'cpf' | 'cnpj';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
  totalRentals: number;
}

export const customerService = {
  generateId(): string {
    return `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'totalRentals'>): Customer {
    return {
      id: this.generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      document: data.document,
      documentType: data.documentType,
      address: data.address,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      totalRentals: 0,
    };
  },
  
  formatDocument(document: string, type: 'cpf' | 'cnpj'): string {
    const cleaned = document.replace(/\D/g, '');
    
    if (type === 'cpf' && cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    if (type === 'cnpj' && cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return document;
  },
  
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  },
  
  incrementRentals(customer: Customer): Customer {
    return {
      ...customer,
      totalRentals: customer.totalRentals + 1,
    };
  },
};
