export interface ContractItem {
  id: string;
  sku: string;
  name: string;
  imageUri?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    diameter?: number;
  };
  quantity: number;
  days: number;
  unitPrice: number;
  total: number;
  replacementPrice: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  
  // Cliente
  customerId: string;
  customerName: string;
  customerDocument: string;
  customerDocumentType: 'cpf' | 'cnpj';
  customerPhone: string;
  customerEmail: string;
  customerAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Datas
  orderDate: string;
  rentalStartDate: string;
  rentalEndDate: string;
  deliveryDate: string;
  deliveryTime: 'morning' | 'afternoon' | 'evening';
  returnDate: string;
  returnTime: 'morning' | 'afternoon' | 'evening';
  
  // Objetivo
  eventPurpose?: string;
  
  // Logística
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  
  // Itens
  items: ContractItem[];
  
  // Valores
  subtotal: number;
  totalAmount: number;
  
  // Status
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  
  // Observações
  notes?: string;
  
  createdAt: string;
}

export const contractService = {
  generateContractNumber(count: number): string {
    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(6, '0');
    return `CONT-${year}-${paddedCount}`;
  },
  
  generateId(): string {
    return `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  calculateItemTotal(quantity: number, days: number, unitPrice: number): number {
    return quantity * days * unitPrice;
  },
  
  calculateSubtotal(items: ContractItem[]): number {
    return items.reduce((sum, item) => sum + item.total, 0);
  },
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },
  
  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  },
  
  formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
  
  formatTime(time: 'morning' | 'afternoon' | 'evening'): string {
    const times = {
      morning: 'MANHÃ',
      afternoon: 'TARDE',
      evening: 'NOITE',
    };
    return times[time];
  },
  
  formatDayOfWeek(isoString: string): string {
    const date = new Date(isoString);
    const days = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
    return days[date.getDay()];
  },
  
  calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  },
  
  formatDimensions(dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    diameter?: number;
  }): string {
    if (!dimensions) return '';
    
    const parts: string[] = [];
    if (dimensions.length) parts.push(`Comp.: ${dimensions.length.toFixed(2)} cm`);
    if (dimensions.height) parts.push(`Alt.: ${dimensions.height.toFixed(2)} cm`);
    if (dimensions.width) parts.push(`Larg.: ${dimensions.width.toFixed(2)} cm`);
    if (dimensions.diameter) parts.push(`Diam.: ${dimensions.diameter.toFixed(2)} cm`);
    
    return parts.join(' | ');
  },
  
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#F59E0B',
      confirmed: '#3B82F6',
      active: '#10B981',
      completed: '#6B7280',
      cancelled: '#EF4444',
    };
    return colors[status] || colors.pending;
  },
  
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      active: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  },
  
  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      partial: 'Parcial',
      paid: 'Pago',
    };
    return labels[status] || status;
  },
  
  getContractClauses(): string[] {
    return [
      'OBJETO: A presente proposta tem por objeto a locação de itens, conforme disposições acima, os quais são entregues ao LOCATÁRIO em perfeitas condições de uso e assim devendo ser devolvidos à LOCADORA.',
      
      '1. FORMA DE PAGAMENTO: O valor deste contrato refere-se apenas ao valor da locação dos materiais. Para fazer a contratação do material o locatário deverá solicitar a confirmação da disponibilidade dos itens e após a confirmação deve ser feito o pagamento de no mínimo 50% do valor do contrato à vista.',
      
      '2. FRETE E CUSTO: A Locadora não se responsabiliza pela entrega e retirada dos materiais contratados. O frete é responsabilidade do locatário, assim como retirada e devolução em horário previamente acordados com a empresa. A não devolução do material na data acordada gerará cobrança de nova diária de aluguel a cada dia de atraso.',
      
      '3. DO INADIMPLEMENTO: A falta de pagamento de qualquer parcela na data acordada acarretará ao Locatário multa de 2%, juros de mora de 1% ao mês e correção monetária.',
      
      '4. VALIDADE DO ORÇAMENTO: O orçamento não configura reserva de material e só é validado após a confirmação de disponibilidade do material. Os valores dos itens são válidos apenas por 07 dias após o envio do orçamento.',
      
      '5. CONSIDERAÇÕES GERAIS: Os bens locados não poderão ser sublocados no todo ou em parte, nem cedidos a terceiros. Todos os elementos constantes deste contrato não poderão ser danificados. Não será permitido furar, colar, cortar, pintar, grampear ou adesivar qualquer equipamento.',
      
      '6. DO FORO: As partes elegem o Foro da Cidade como competente para dirimirem as questões decorrentes da execução deste Contrato.',
    ];
  },
};
