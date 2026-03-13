# 🔧 Funções Principais - EstoqueControl

## 📦 Material Service (`services/materialService.ts`)

### Funções CRUD

#### `createMaterial(data: Omit<Material, 'id' | 'rentedQuantity' | 'status' | 'statusHistory' | 'createdAt'>): Material`
Cria um novo material no sistema.
- Gera ID único (UUID)
- Inicializa `rentedQuantity = 0`
- Define status inicial = 'available'
- Registra data de criação
- Cria histórico de status inicial

#### `updateMaterial(material: Material, updates: Partial<Material>): Material`
Atualiza dados de um material existente.
- Merge de propriedades
- Preserva ID e timestamps
- Retorna material atualizado

#### `deleteMaterial(materialId: string): void`
Remove material do sistema (soft delete).
- Verifica se não está locado
- Remove referências
- Mantém histórico

### Funções de Movimentação

#### `processEntry(material: Material, quantity: number): Material`
Processa entrada de material no estoque.
- Incrementa `totalQuantity`
- Recalcula disponibilidade
- Atualiza status se necessário
- Registra movimentação

#### `processExit(material: Material, quantity: number, customer?: string): Material`
Processa saída de material (locação).
- Incrementa `rentedQuantity`
- Reduz disponibilidade
- Valida quantidade disponível
- Atualiza status para 'rented' se necessário
- Registra cliente
- Cria movimento de saída

#### `processReturn(material: Material, quantity: number): Material`
Processa devolução de material.
- Decrementa `rentedQuantity`
- Incrementa disponibilidade
- Atualiza status para 'available' se totalmente devolvido
- Registra movimento de retorno

### Funções de Cálculo

#### `calculateAvailable(material: Material): number`
Calcula quantidade disponível para locação.
```typescript
return material.totalQuantity 
  - material.rentedQuantity
  - (status === 'maintenance' ? totalQuantity : 0)
  - (status === 'damaged' ? totalQuantity : 0)
  - (status === 'retired' ? totalQuantity : 0);
```

#### `calculateUtilizationRate(materials: Material[]): number`
Calcula taxa de utilização do estoque (%).
```typescript
totalRented / totalQuantity * 100
```

### Funções de Status

#### `addStatusHistory(material: Material, newStatus: MaterialStatus, changedBy: string, reason?: string): Material`
Adiciona registro de mudança de status ao histórico.
- Registra timestamp
- Salva usuário que fez a mudança
- Salva motivo da mudança
- Atualiza status atual

#### `getStatusLabel(status: MaterialStatus): string`
Retorna label em português do status.
- `available` → "Disponível"
- `rented` → "Locado"
- `maintenance` → "Manutenção"
- `damaged` → "Danificado"
- `retired` → "Baixa"

#### `getStatusColor(status: MaterialStatus): string`
Retorna cor associada ao status.
- Disponível: Verde
- Locado: Azul
- Manutenção: Laranja
- Danificado: Vermelho
- Baixa: Cinza

### Funções de Movimento

#### `createMovement(materialId: string, type: MovementType, quantity: number, meta?: object): Movement`
Cria registro de movimentação.
- Gera ID único
- Registra timestamp
- Salva metadados (ex: cliente na saída)

#### `generateChartData(days: number): ChartData[]`
Gera dados para gráfico de movimentações.
- Retorna array com dados dos últimos N dias
- Usado no dashboard e relatórios

---

## 👥 Customer Service (`services/customerService.ts`)

### `createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Customer`
Cria novo cliente.
- Gera ID único
- Valida CPF/CNPJ
- Valida email e telefone
- Registra data de cadastro

### `updateCustomer(customer: Customer, updates: Partial<Customer>): Customer`
Atualiza dados do cliente.

### `validateDocument(document: string): boolean`
Valida CPF ou CNPJ.
- Verifica formato
- Valida dígitos verificadores

### `formatDocument(document: string): string`
Formata CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00).

### `formatPhone(phone: string): string`
Formata telefone (00) 00000-0000.

### `formatZipCode(zipCode: string): string`
Formata CEP 00000-000.

---

## 📝 Rental Service (`services/rentalService.ts`)

### `createRental(data: Omit<RentalNote, 'id' | 'noteNumber' | 'status' | 'createdAt'>): RentalNote`
Cria nova locação.
- Gera número sequencial (LOC-001/2025)
- Define status inicial = 'active'
- Calcula data de devolução
- Valida dados
- Registra timestamp

### `updateRentalStatus(rental: RentalNote): RentalNote`
Atualiza status da locação automaticamente.
- Verifica se está atrasada (expectedReturnDate < hoje)
- Verifica se foi devolvida (actualReturnDate preenchido)
- Atualiza status: active | overdue | returned

### `processReturn(rental: RentalNote, observations: string): RentalNote`
Processa devolução completa da locação.
- Valida se todos os itens foram devolvidos
- Registra data de devolução
- Salva observações
- Atualiza status para 'returned'

### `calculateTotalValue(rental: RentalNote, itemPrices: Record<string, number>): number`
Calcula valor total da locação.
```typescript
Σ (quantidade × valorUnitário)
```

### `calculateDaysOverdue(rental: RentalNote): number`
Calcula dias de atraso.
```typescript
hoje - expectedReturnDate (se positivo)
```

### `generateNoteNumber(): string`
Gera número sequencial da nota.
- Formato: LOC-001/2025
- Incrementa automaticamente

---

## 🚚 Logistics Service (`services/logisticsService.ts`)

### `createDelivery(data: Omit<Delivery, 'id' | 'createdAt'>): Delivery`
Cria registro de entrega/retirada.
- Gera ID único
- Define status inicial = 'pending'
- Vincula com nota de locação

### `updateDeliveryStatus(delivery: Delivery, newStatus: DeliveryStatus): Delivery`
Atualiza status da entrega.
- pending → in_transit → delivered
- Registra data de entrega real

### `getDeliveriesByDate(deliveries: Delivery[], date: string): Delivery[]`
Filtra entregas por data agendada.

### `getPendingDeliveries(deliveries: Delivery[]): Delivery[]`
Retorna entregas pendentes.

---

## 📄 PDF Service (`services/pdfService.ts`)

### `generateRentalPDF(options: PDFOptions): Promise<string>`
Gera PDF da nota de locação.
- Recebe dados da locação, materiais e preços
- Gera HTML estilizado
- Converte para PDF via expo-print
- Retorna URI do arquivo

### `generateReturnPDF(options: ReturnPDFOptions): Promise<string>`
Gera PDF da nota de devolução.
- Similar à nota de locação
- Inclui observações de devolução
- Estado de cada item devolvido

### `sharePDF(uri: string, noteNumber: string): Promise<void>`
Compartilha PDF via share nativo.
- WhatsApp, Email, Drive, etc.

### `downloadPDF(uri: string, noteNumber: string): Promise<string>`
Salva PDF na galeria/downloads do dispositivo.

### `generateHTML(rental: RentalNote, materials: Material[], itemPrices: Record<string, number>): string`
Gera HTML formatado para PDF.
- Template profissional
- Logo EstoqueControl
- Gradientes e estilização
- Tabelas responsivas
- Cláusulas contratuais

---

## 📊 Context Functions

### MaterialsContext

#### `addMaterial(data): void`
Adiciona material ao estado global.

#### `updateMaterial(id, updates): void`
Atualiza material no estado.

#### `updateMaterialStatus(id, newStatus, changedBy, reason?): void`
Muda status do material e registra histórico.

#### `deleteMaterial(id): void`
Remove material do estado.

#### `processEntry(materialId, quantity): void`
Processa entrada de estoque.

#### `processExit(materialId, quantity, customer?): void`
Processa saída para locação.

#### `processReturn(materialId, quantity): void`
Processa devolução.

#### `getTotalItems(): number`
Retorna total de itens no estoque.

#### `getTotalRented(): number`
Retorna total de itens locados.

#### `getTotalAvailable(): number`
Retorna total de itens disponíveis.

#### `getMaterialById(id): Material | undefined`
Busca material por ID.

#### `refreshChartData(): void`
Atualiza dados do gráfico.

### CustomersContext

#### `addCustomer(data): void`
Adiciona cliente ao estado.

#### `updateCustomer(id, updates): void`
Atualiza cliente.

#### `deleteCustomer(id): void`
Remove cliente.

#### `getCustomerById(id): Customer | undefined`
Busca cliente por ID.

### RentalsContext

#### `addRental(data): RentalNote`
Cria nova locação.

#### `updateRental(id, updates): void`
Atualiza locação.

#### `returnRental(id, observations): void`
Processa devolução completa.

#### `getActiveRentals(): RentalNote[]`
Retorna locações ativas.

#### `getOverdueRentals(): RentalNote[]`
Retorna locações atrasadas.

#### `getRentalsByCustomer(customerId): RentalNote[]`
Retorna locações de um cliente.

### LogisticsContext

#### `addDelivery(data): Delivery`
Cria registro de entrega.

#### `updateDeliveryStatus(id, status): void`
Atualiza status da entrega.

#### `getPendingDeliveries(): Delivery[]`
Retorna entregas pendentes.

---

## 🎨 UI Components Functions

### Button Component

#### `onPress(): void`
Callback ao pressionar.

#### `disabled: boolean`
Estado desabilitado.

#### `loading: boolean`
Mostra indicador de carregamento.

#### `variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'`
Variante visual.

### Input Component

#### `onChangeText(text: string): void`
Callback de mudança de texto.

#### `value: string`
Valor controlado.

#### `placeholder: string`
Placeholder.

#### `error?: string`
Mensagem de erro.

#### `keyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad'`
Tipo de teclado.

### QRScanner Component

#### `onScan(data: string): void`
Callback ao escanear código.

#### `onClose(): void`
Callback ao fechar scanner.

#### `title?: string`
Título do scanner.

---

## 🔄 Hook Functions

### useMaterials()
Retorna contexto de materiais com todas as funções.

### useCustomers()
Retorna contexto de clientes com todas as funções.

### useRentals()
Retorna contexto de locações com todas as funções.

### useLogistics()
Retorna contexto de logística com todas as funções.

### useAlert()
Retorna função `showAlert(title, message)` para alertas globais.

---

## 📱 Navigation Functions

### `router.push(href: string)`
Navega para nova tela.

### `router.back()`
Volta para tela anterior.

### `router.replace(href: string)`
Substitui tela atual.

---

## 💾 AsyncStorage Functions

### `AsyncStorage.setItem(key: string, value: string): Promise<void>`
Salva dados localmente.

### `AsyncStorage.getItem(key: string): Promise<string | null>`
Recupera dados salvos.

### `AsyncStorage.removeItem(key: string): Promise<void>`
Remove dados.

### `AsyncStorage.clear(): Promise<void>`
Limpa todos os dados (usar com cuidado).

---

## 📸 Image Functions

### `ImagePicker.launchCameraAsync(options): Promise<ImageResult>`
Abre câmera para tirar foto.

### `ImagePicker.launchImageLibraryAsync(options): Promise<ImageResult>`
Abre galeria para selecionar foto.

---

## 📊 Utility Functions

### `generateUUID(): string`
Gera ID único universal.

### `formatCurrency(value: number): string`
Formata valor em reais (R$ 1.234,56).

### `formatDate(date: string | Date): string`
Formata data (DD/MM/YYYY).

### `formatDateTime(date: string | Date): string`
Formata data e hora (DD/MM/YYYY HH:mm).

### `calculateDaysBetween(start: Date, end: Date): number`
Calcula diferença em dias entre datas.

### `isOverdue(expectedDate: string): boolean`
Verifica se data esperada já passou.

---

## 🎯 Validation Functions

### `validateEmail(email: string): boolean`
Valida formato de email.

### `validatePhone(phone: string): boolean`
Valida formato de telefone brasileiro.

### `validateCPF(cpf: string): boolean`
Valida CPF com dígitos verificadores.

### `validateCNPJ(cnpj: string): boolean`
Valida CNPJ com dígitos verificadores.

### `validateZipCode(zipCode: string): boolean`
Valida formato de CEP (00000-000).

---

**Total de Funções Principais**: ~80+  
**Cobertura**: CRUD completo, validações, cálculos, PDFs, imagens, navegação, armazenamento

**Todas as funções seguem princípios**:
- Tipagem forte com TypeScript
- Validação de entrada
- Tratamento de erros
- Retornos consistentes
- Documentação inline
- Testes unitários (futuro)
