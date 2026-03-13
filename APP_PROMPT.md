# 📋 Prompt Completo - EstoqueControl

## 🎯 Visão Geral do Sistema

EstoqueControl é um **sistema completo de gestão de estoque e locações** desenvolvido em React Native + Expo, voltado para empresários do ramo de locação de equipamentos e materiais para eventos.

## 📱 Tipo de Aplicação

- **Plataforma**: Mobile (iOS + Android)
- **Framework**: React Native com Expo SDK 54+
- **Linguagem**: TypeScript
- **Navegação**: Expo Router (file-based)
- **Armazenamento**: AsyncStorage (local)

## 🎨 Design e UX

### Interface
- Design moderno e profissional
- Cores: Gradiente roxo/azul (#667EEA → #764BA2)
- Tipografia clara e hierárquica
- Ícones: @expo/vector-icons (Ionicons)
- Componentes padronizados

### Navegação
- Tab Navigation (6 abas principais)
- Modal screens para formulários
- Stack navigation para detalhes

### Abas do App
1. **Dashboard** - Visão geral e estatísticas
2. **Materiais** - Gestão de equipamentos
3. **Clientes** - Cadastro de clientes
4. **Locados** - Materiais em locação
5. **Bip Scan** - Saída de materiais
6. **Relatórios** - Análises e dados

## 🔧 Funcionalidades Principais

### 1. Dashboard em Tempo Real
**Objetivo**: Visão executiva do negócio

**Indicadores**:
- Total de itens no estoque
- Itens disponíveis para locação
- Itens em manutenção
- Itens locados atualmente
- Total de clientes cadastrados
- Total de locações ativas

**Ações Rápidas**:
- Visualizar QR Codes
- Acessar configurações
- Ver relatórios detalhados

**Atualização**: Automática quando há:
- Cadastro de novos materiais
- Mudança de status de materiais
- Novas locações
- Devoluções

### 2. Gestão de Materiais
**Objetivo**: Controle completo do estoque

**Campos do Material**:
- Nome
- Código/SKU (único)
- Descrição
- Quantidade total
- Quantidade alugada (calculado automaticamente)
- Quantidade disponível (calculado: total - alugada - manutenção - danificada - baixa)
- Status (Disponível, Locado, Manutenção, Danificado, Baixa)
- Valor de locação
- Valor de reposição
- Categoria
- Localização
- Foto (upload via camera/galeria)
- Histórico de status (quem mudou, quando, por que)

**Status do Material**:
- **Disponível**: Pronto para locar
- **Locado**: Em uso por cliente
- **Manutenção**: Em reparo, não pode locar
- **Danificado**: Precisa reparo urgente
- **Baixa**: Removido do estoque ativo

**Regras de Negócio**:
- Quantidade disponível = total - (locada + manutenção + danificada + baixa)
- Não pode locar se status = manutenção, danificado ou baixa
- Cada mudança de status registra histórico (data, usuário, motivo)
- QR Code gerado automaticamente para cada material

**Funcionalidades**:
- Cadastro com foto
- Edição completa
- Mudança de status com observação
- Geração de QR Code para impressão
- Visualização de histórico
- Busca e filtros

### 3. Gestão de Clientes
**Objetivo**: Cadastro completo de locatários

**Campos do Cliente**:
- Nome completo / Razão social
- CPF / CNPJ
- Telefone
- Email
- Endereço completo (rua, número, complemento, bairro, cidade, UF, CEP)
- Data de cadastro
- Status (ativo/inativo)

**Funcionalidades**:
- Cadastro completo
- Edição de dados
- Histórico de locações do cliente
- Busca por nome/documento

### 4. Sistema de Locações (Bip Scan)
**Objetivo**: Registro de saída de materiais

**Fluxo de Saída**:
1. Selecionar cliente (obrigatório)
2. Adicionar materiais ao carrinho:
   - Via scanner QR Code (câmera)
   - Via seleção manual da lista
3. Para cada material no carrinho:
   - Quantidade (validação: não pode exceder disponível)
   - Valor unitário (editável)
   - Dias de locação (editável)
4. Configurar entrega:
   - Tipo: Entrega ou Retirada
   - Data agendada (em dias)
   - Endereço completo (se entrega)
5. Observações (opcional)
6. Gerar nota de locação

**Validações**:
- Cliente obrigatório
- Ao menos 1 item no carrinho
- Quantidade não pode exceder disponível
- Endereço obrigatório se tipo = entrega
- Status do material deve ser "Disponível"

**Ao Confirmar**:
- Atualiza quantidade locada de cada material
- Cria registro de locação
- Cria entrega na logística
- Gera nota PDF com:
  - Logo EstoqueControl
  - Dados do cliente
  - Lista de materiais com fotos
  - Quantidade, valor unitário e total por item
  - Valor total da locação
  - Data de saída
  - Data de devolução prevista
  - Endereço de entrega
  - Cláusulas contratuais
  - Número sequencial da nota
  - Assinatura/termo
- Atualiza dashboard

### 5. Sistema de Devoluções (Locados)
**Objetivo**: Controle de devolução item por item

**Tela Locados**:
- Lista todos os materiais atualmente locados
- Filtros: Ativos, Atrasados, Devolvidos
- Cards mostram:
  - Nome do material
  - Cliente
  - Data de saída
  - Data de devolução prevista
  - Quantidade locada
  - Status (no prazo, atrasado, devolvido)

**Fluxo de Devolução**:
1. Selecionar item locado
2. Clicar "Devolver"
3. **Obrigatório**: Informar estado do material:
   - Normal (volta como disponível)
   - Danificado (muda status para danificado)
   - Avariado (observação especial)
4. Observações detalhadas (obrigatório)
5. Confirmar devolução

**Validações**:
- Não pode finalizar locação até devolver 100% dos itens
- Observação obrigatória
- Estado obrigatório

**Ao Confirmar Devolução Completa**:
- Atualiza quantidade locada (reduz)
- Atualiza status do material conforme informado
- Atualiza quantidade disponível
- Marca locação como devolvida
- Gera nota de devolução PDF com:
  - Dados do cliente
  - Lista de itens devolvidos
  - Estado de cada item
  - Data/hora da devolução
  - Observações
  - Número sequencial
  - Assinatura/termo
- Atualiza dashboard

### 6. Logística
**Objetivo**: Controle de entregas e retiradas

**Tipos**:
- **Entrega**: Equipamentos levados ao cliente
- **Retirada**: Cliente busca no local

**Campos**:
- Cliente
- Materiais
- Tipo (entrega/retirada)
- Data agendada
- Endereço (se entrega)
- Status (pendente, em rota, entregue)
- Observações
- Número da nota de locação vinculada

**Funcionalidades**:
- Lista de entregas pendentes
- Filtro por data
- Mudança de status
- Visualização de endereço

### 7. Relatórios
**Objetivo**: Análise de dados e performance

**Relatórios Disponíveis**:

**Top 5 Materiais Mais Locados**:
- Ranking dos equipamentos com maior demanda
- Quantidade de locações
- Valor total gerado

**Últimas Movimentações**:
- Histórico cronológico
- Tipo: entrada, saída, devolução, info
- Material, quantidade, data
- Cliente (se saída)

**Status de Materiais**:
- Lista completa de todos os materiais
- Status atual de cada um
- Quantidade disponível vs total
- Localização
- Última atualização

**Taxa de Utilização**:
- Percentual do estoque em uso
- Materiais ociosos
- Materiais em manutenção

### 8. QR Code System
**Objetivo**: Identificação rápida de materiais

**Geração**:
- Automática ao cadastrar material
- Código contém: SKU do material
- Formato: QR Code padrão

**Impressão**:
- Tela dedicada de visualização
- Opção de download
- Opção de compartilhar
- Sugestão: colar QR Code físico no equipamento

**Leitura**:
- Via câmera do celular
- Identificação automática do material
- Adição direta ao carrinho (se cliente selecionado)
- Exibe informações do material

## 🗄️ Estrutura de Dados

### Material
```typescript
{
  id: string;                    // UUID único
  name: string;                  // Nome do equipamento
  sku: string;                   // Código único (ex: "MAT-001")
  description?: string;          // Descrição detalhada
  category?: string;             // Categoria/tipo
  totalQuantity: number;         // Quantidade total no estoque
  rentedQuantity: number;        // Quantidade atualmente locada
  rentalPrice?: number;          // Valor diário de locação
  replacementCost?: number;      // Valor de reposição
  location?: string;             // Localização física
  status: MaterialStatus;        // Disponível | Locado | Manutenção | Danificado | Baixa
  imageUri?: string;             // Caminho da foto
  statusHistory: Array<{         // Histórico de mudanças
    status: MaterialStatus;
    changedAt: string;           // ISO timestamp
    changedBy: string;           // Quem mudou
    reason?: string;             // Motivo da mudança
  }>;
  createdAt: string;             // Data de cadastro
}
```

### Cliente
```typescript
{
  id: string;
  name: string;
  document: string;              // CPF ou CNPJ
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  active: boolean;
  createdAt: string;
}
```

### Locação (RentalNote)
```typescript
{
  id: string;
  noteNumber: string;            // Ex: "LOC-001/2025"
  customerId: string;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerEmail: string;
  materials: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;           // Valor cobrado (pode diferir do cadastro)
  }>;
  rentalDate: string;            // Data de saída
  expectedReturnDate: string;    // Data prevista de devolução
  actualReturnDate?: string;     // Data real de devolução (quando devolvido)
  status: 'active' | 'overdue' | 'returned';
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  notes?: string;                // Observações
  deliveryId?: string;           // Vínculo com logística
  returnObservations?: string;   // Observações da devolução
  createdAt: string;
}
```

### Entrega (Delivery)
```typescript
{
  id: string;
  customerId: string;
  customerName: string;
  materialIds: string[];
  type: 'delivery' | 'pickup';
  scheduledDate: string;
  actualDate?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
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
```

### Movimentação (Movement)
```typescript
{
  id: string;
  materialId: string;
  type: 'entry' | 'exit' | 'return' | 'info';
  quantity: number;
  date: string;
  customer?: string;             // Nome do cliente (se saída)
}
```

## 🎨 Componentes UI Customizados

### Button
- Variantes: primary, secondary, outline, danger, success
- Estados: normal, pressed, disabled
- Loading indicator integrado

### Input
- Label customizável
- Placeholder
- Error state
- Tipos: text, numeric, email, phone
- Máscaras (CPF, CNPJ, CEP, telefone)

### Screen
- Container padrão com SafeArea
- ScrollView opcional
- Padding consistente

### StatCard
- Card de estatística do dashboard
- Ícone, título, valor
- Cores customizáveis

### MaterialCard
- Card de material na lista
- Foto, nome, SKU
- Status badge
- Quantidade disponível

### QRScanner
- Componente de scanner
- Solicitação de permissão
- Feedback visual
- Suporte a QR Code e códigos de barras

## 🔄 Fluxos de Trabalho

### Fluxo 1: Cadastrar e Locar Material pela Primeira Vez
1. Dashboard → Materiais → Botão "+"
2. Preencher dados do material
3. Adicionar foto
4. Salvar
5. QR Code gerado automaticamente
6. Imprimir QR Code e colar no equipamento físico
7. Dashboard → Clientes → Cadastrar cliente
8. Dashboard → Bip Scan
9. Selecionar cliente
10. Escanear QR Code do material
11. Configurar quantidade, valor, dias
12. Preencher dados de entrega
13. Gerar nota de locação
14. Entregar equipamento ao cliente

### Fluxo 2: Fazer Devolução
1. Dashboard → Locados
2. Visualizar lista de materiais locados
3. Selecionar o item a devolver
4. Clicar "Devolver"
5. Informar estado (normal/danificado/avariado)
6. Adicionar observações
7. Confirmar
8. Se todos os itens devolvidos → Gera nota de devolução
9. Estoque atualizado automaticamente
10. Dashboard atualizado

### Fluxo 3: Material em Manutenção
1. Dashboard → Materiais
2. Selecionar material
3. Editar → Mudar status para "Manutenção"
4. Informar motivo (ex: "Reparo preventivo")
5. Salvar
6. Material fica indisponível para locação
7. Quantidade disponível recalculada
8. Após manutenção → Mudar status para "Disponível"

## 📊 Regras de Cálculo

### Quantidade Disponível
```
disponível = total - locada - manutenção - danificada - baixa
```

### Status do Material (Automático)
- Se `rentedQuantity >= totalQuantity` → Locado
- Se `rentedQuantity > 0 && rentedQuantity < totalQuantity` → Disponível (parcialmente locado)
- Se `rentedQuantity = 0` → Disponível
- Se `status = manutenção | danificado | baixa` → Mantém status manual

### Status da Locação
- `active`: dentro do prazo
- `overdue`: data de devolução passou
- `returned`: todos os itens devolvidos

### Valor Total da Locação
```
total = Σ (quantidade × valor_unitário × dias)
```

## 🎯 Validações Críticas

### Ao Locar Material
- [x] Cliente selecionado
- [x] Material existe
- [x] Status do material = "Disponível"
- [x] Quantidade solicitada ≤ quantidade disponível
- [x] Quantidade > 0
- [x] Valor > 0
- [x] Dias > 0
- [x] Se entrega: endereço completo preenchido

### Ao Devolver Material
- [x] Locação existe
- [x] Item ainda não devolvido
- [x] Estado informado (normal/danificado/avariado)
- [x] Observação preenchida

### Ao Cadastrar Material
- [x] Nome preenchido
- [x] SKU único
- [x] Quantidade total > 0
- [x] Valores numéricos válidos

### Ao Cadastrar Cliente
- [x] Nome preenchido
- [x] Documento válido (CPF ou CNPJ)
- [x] Telefone válido
- [x] Email válido

## 🔐 Armazenamento

### AsyncStorage Keys
- `@materials` → Array<Material>
- `@movements` → Array<Movement>
- `@customers` → Array<Customer>
- `@rentals` → Array<RentalNote>
- `@logistics` → Array<Delivery>
- `@contracts` → Array<Contract>
- `@suppliers` → Array<Supplier>

### Persistência
- Dados salvos automaticamente após cada operação
- Carregados ao iniciar o app
- Backup manual via exportação (funcionalidade futura)

## 📄 Geração de PDFs

### Nota de Locação
**Estrutura**:
1. Header com logo e gradiente
2. Número da nota
3. Status badge (ativa/atrasada/devolvida)
4. Dados do cliente
5. Período de locação (data saída → devolução)
6. Tabela de materiais com fotos
7. Total por item e total geral
8. Endereço de entrega
9. Cláusulas contratuais
10. Footer com créditos

**Cláusulas Padrão**:
- Responsabilidade pelos materiais
- Condições de devolução
- Multas por atraso
- Proibições (furar, colar, pintar)
- Valor de reposição em caso de dano
- Foro

### Nota de Devolução
**Estrutura**:
1. Header com logo
2. Número da nota de devolução
3. Dados do cliente
4. Dados da locação original
5. Lista de itens devolvidos com estado
6. Data/hora da devolução
7. Observações
8. Campo para assinatura
9. Créditos

## 🎨 Tema e Cores

### Paleta Principal
- **Primary**: #667EEA (roxo/azul)
- **Primary Dark**: #764BA2
- **Success**: #10B981 (verde)
- **Danger**: #EF4444 (vermelho)
- **Warning**: #F59E0B (laranja)
- **Info**: #3B82F6 (azul)

### Cores de Status
- Disponível: Verde (#10B981)
- Locado: Azul (#3B82F6)
- Manutenção: Laranja (#F59E0B)
- Danificado: Vermelho (#EF4444)
- Baixa: Cinza (#6B7280)

### Tipografia
- **Title**: 28px, Bold
- **Subtitle**: 20px, Semibold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular
- **Small**: 12px, Regular

## 🚀 Tecnologias Utilizadas

### Core
- React Native 0.79.x
- Expo SDK 54+
- TypeScript 5.3.3
- Expo Router 5.x

### UI/UX
- @expo/vector-icons
- react-native-safe-area-context
- expo-linear-gradient (gradientes)

### Funcionalidades
- expo-camera (scanner QR)
- expo-image (otimização de imagens)
- expo-image-picker (upload)
- expo-print (geração PDF)
- expo-sharing (compartilhamento)
- react-native-qrcode-svg (geração QR)
- @react-native-async-storage/async-storage (persistência)

### Dev Tools
- ESLint
- Babel
- Metro bundler

## 📱 Compatibilidade

- **iOS**: 13.0+
- **Android**: 6.0+ (API 23+)
- **Expo Go**: Sim
- **Web**: Parcial (necessário build)

## 🎓 Conceitos Aplicados

- Context API para gerenciamento de estado
- Custom Hooks para lógica reutilizável
- Service layer para regras de negócio
- Component-driven development
- Type-safe com TypeScript
- File-based routing
- Offline-first (dados locais)
- Responsive design
- Acessibilidade (SafeArea, contraste)

## 📌 Observações Importantes

1. **Dados Locais**: Todo armazenamento é local no dispositivo, sem sincronização em nuvem
2. **QR Codes**: Formato padrão, podem ser lidos por qualquer leitor
3. **PDFs**: Gerados nativamente via expo-print, otimizados para A4
4. **Fotos**: Armazenadas localmente, sem compressão automática
5. **Validações**: Implementadas tanto no frontend quanto na service layer
6. **Performance**: Listas otimizadas com FlatList
7. **UX**: Feedback visual para todas as ações
8. **Erros**: Tratamento global com alertas amigáveis

## 🎯 Diferencial do Sistema

**EstoqueControl não é apenas um controle de estoque**, é uma solução completa para gestão de locações que:

✅ Elimina planilhas manuais  
✅ Previne dupla locação (validação em tempo real)  
✅ Gera documentos profissionais automaticamente  
✅ Rastreia estado dos equipamentos  
✅ Facilita devoluções com validação obrigatória  
✅ Oferece visão executiva do negócio  
✅ Funciona offline (dados locais)  
✅ Interface intuitiva e moderna  
✅ Scanner QR Code para agilidade  

---

**Desenvolvido por:** Crystian Fernando Gomes da Silva - 2025  
**Propósito:** Levar eficiência e profissionalismo ao empresário do ramo de locações
