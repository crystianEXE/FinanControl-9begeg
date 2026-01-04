# 📦 EstoqueControl

Sistema completo de gestão de locações de equipamentos e materiais para eventos.

![EstoqueControl](https://img.shields.io/badge/version-1.0.0-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.76-blue)
![Expo](https://img.shields.io/badge/Expo-52-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 📋 Sobre o Projeto

EstoqueControl foi desenvolvido pensando no empresário do ramo de locação de equipamentos e materiais para eventos. Oferece gestão completa de estoque, clientes, contratos e logística, trazendo eficiência e organização para o seu negócio.

### 🎯 Funcionalidades Principais

- **Gestão de Materiais**
  - Cadastro com fotos
  - QR Code para rastreamento
  - Controle de status (Disponível/Manutenção/Danificado/Baixa)
  - Histórico de alterações
  - Valores de locação e reposição

- **Gestão de Clientes**
  - Cadastro completo
  - Histórico de locações
  - Validações de dados

- **Sistema de Locações**
  - Carrinho com múltiplos itens
  - Scanner de QR Code
  - Valores personalizáveis
  - Cálculo automático de totais
  - Geração de notas em PDF

- **Devoluções Inteligentes**
  - Devolução item por item
  - Observações obrigatórias
  - Atualização automática de status
  - Validações de integridade

- **Dashboard em Tempo Real**
  - Indicadores atualizados automaticamente
  - Gráficos de movimentação
  - Estatísticas do negócio

- **Relatórios Completos**
  - Top 5 materiais mais locados
  - Taxa de utilização
  - Últimas movimentações
  - Status de todos os itens

---

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **Expo Router** - Navegação file-based
- **AsyncStorage** - Persistência de dados local
- **Expo Image** - Otimização de imagens
- **Expo Print** - Geração de PDFs
- **Expo Camera** - Scanner de QR Code
- **React Native Reanimated** - Animações
- **React Native SVG** - Gráficos e ícones

---

## 📱 Estrutura do Projeto

```
estoquecontrol/
├── app/                      # Expo Router pages
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Dashboard
│   │   ├── materials.tsx    # Lista de materiais
│   │   ├── customers.tsx    # Lista de clientes
│   │   ├── rentals.tsx      # Materiais locados
│   │   ├── scan.tsx         # Bip/Scan para saída
│   │   └── reports.tsx      # Relatórios
│   ├── add-material.tsx     # Cadastro de material
│   ├── edit-material.tsx    # Edição de material
│   ├── add-customer.tsx     # Cadastro de cliente
│   ├── edit-customer.tsx    # Edição de cliente
│   ├── rental-note.tsx      # Visualização de nota
│   └── _layout.tsx          # Root layout
├── components/              # Componentes reutilizáveis
│   ├── ui/                  # Componentes básicos
│   ├── layout/              # Componentes de layout
│   └── feature/             # Componentes específicos
├── contexts/                # Context API (Estado global)
│   ├── MaterialsContext.tsx
│   ├── CustomersContext.tsx
│   ├── RentalsContext.tsx
│   ├── LogisticsContext.tsx
│   └── ContractsContext.tsx
├── services/                # Lógica de negócio
│   ├── materialService.ts
│   ├── customerService.ts
│   ├── rentalService.ts
│   ├── pdfService.ts
│   └── ...
├── hooks/                   # Custom hooks
├── constants/               # Constantes e temas
├── assets/                  # Imagens e arquivos estáticos
└── BUILD_GUIDE.md          # Guia de build e publicação
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn
- Expo Go app no celular (para desenvolvimento)

### Instalação

```bash
# Clone o repositório (se aplicável)
git clone [url-do-repo]

# Entre na pasta
cd estoquecontrol

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npx expo start
```

### Desenvolvimento
```bash
# Limpar cache
npx expo start -c

# Executar no Android
npx expo start --android

# Executar no iOS
npx expo start --ios

# Executar na web
npx expo start --web
```

---

## 📦 Build e Publicação

### Android (APK/AAB)
```bash
# Configurar EAS Build
eas build:configure

# Build APK (desenvolvimento)
eas build --platform android --profile preview

# Build AAB (produção - Google Play)
eas build --platform android --profile production
```

### iOS (IPA)
```bash
# Build para simulador
eas build --platform ios --profile preview

# Build para App Store
eas build --platform ios --profile production
```

Para instruções detalhadas, consulte [BUILD_GUIDE.md](BUILD_GUIDE.md)

---

## ✅ Status do Projeto

**Versão Atual**: 1.0.0  
**Status**: ✅ Pronto para Produção

### Checklist de Funcionalidades
- ✅ Cadastro e edição de materiais
- ✅ Fotos e QR Codes
- ✅ Cadastro e edição de clientes
- ✅ Sistema de locações completo
- ✅ Devoluções com validações
- ✅ Geração de PDF profissional
- ✅ Dashboard em tempo real
- ✅ Relatórios e análises
- ✅ Persistência de dados (AsyncStorage)
- ✅ Interface responsiva
- ✅ Testes completos realizados

---

## 🎨 Design System

### Cores Principais
```javascript
primary: '#667EEA'      // Roxo principal
secondary: '#764BA2'    // Roxo secundário
success: '#10B981'      // Verde sucesso
danger: '#EF4444'       // Vermelho erro
warning: '#F59E0B'      // Amarelo aviso
info: '#3B82F6'         // Azul informação
```

### Tipografia
```javascript
fontSize: {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
}

fontWeight: {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

---

## 📄 Licença

**Proprietary Software**  
© 2025 Crystian Fernando Gomes da Silva. Todos os direitos reservados.

Este software é proprietário e não pode ser copiado, modificado ou distribuído sem autorização expressa do autor.

---

## 👨‍💻 Desenvolvedor

**Crystian Fernando Gomes da Silva**  
Desenvolvedor Full Stack Sênior  
Ano: 2025

---

## 📞 Suporte

Para dúvidas, sugestões ou reportar problemas:
- Email: [seu-email@example.com]
- WhatsApp: [seu-numero]

---

## 🔄 Histórico de Versões

### 1.0.0 (Janeiro 2025)
- 🎉 Lançamento inicial
- ✅ Sistema completo de gestão de materiais
- ✅ Cadastro de clientes
- ✅ Sistema de locações com múltiplos itens
- ✅ Devoluções com observações
- ✅ Geração de PDF profissional
- ✅ QR Code para rastreamento
- ✅ Dashboard em tempo real
- ✅ Relatórios e análises

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ usando OnSpace AI Platform.

**OnSpace**: https://www.onspace.ai

---

**EstoqueControl** - Sistema profissional de gestão de locações 🚀
